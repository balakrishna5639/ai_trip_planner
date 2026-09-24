import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

const textField = { type: 'string' };
const stopSchema = {
  type: 'object',
  properties: {
    id: textField,
    time: textField,
    name: textField,
    description: textField,
    duration: textField,
    type: { type: 'string', enum: ['culture', 'food', 'nature', 'leisure', 'adventure'] },
    tips: textField,
  },
  required: ['id', 'time', 'name', 'description', 'duration', 'type', 'tips'],
  additionalProperties: false,
};
const daySchema = {
  type: 'object',
  properties: {
    id: textField,
    date: textField,
    theme: textField,
    totalDuration: textField,
    stops: { type: 'array', items: stopSchema },
  },
  required: ['id', 'date', 'theme', 'totalDuration', 'stops'],
  additionalProperties: false,
};
const tripSchema = {
  type: 'object',
  properties: {
    trip: {
      type: 'object',
      properties: {
        title: textField,
        destination: textField,
        duration: textField,
        travelStyle: textField,
        days: { type: 'array', items: daySchema },
      },
      required: ['title', 'destination', 'duration', 'travelStyle', 'days'],
      additionalProperties: false,
    },
  },
  required: ['trip'],
  additionalProperties: false,
};

app.post('/api/generate', async (req, res) => {
  const { from, to, days, style, mode, regenerateTheme } = req.body || {};
  if ((mode === 'route' && !from?.trim()) || !to?.trim() || !Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 14 || !style) {
    return res.status(400).json({ error: 'Please enter a destination, trip length, and travel style. Route trips also need a starting location.' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Add GROQ_API_KEY to your .env file, then restart the server.' });
  }
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const tripRoute = mode === 'route' ? 'from ' + from + ' to ' + to : 'in ' + to;
    const prompt = 'Create a realistic itinerary ' + tripRoute + '. The trip lasts ' + days + ' days and has a ' + style + ' style. Focus on ' + (mode === 'route' ? 'places along the route' : 'places at the destination') + '. Return exactly ' + days + ' day(s), with at least three stops per day. All IDs must be strings such as "day-1" and "stop-1-1". Every stop needs a concise description and practical tip. Keep all text fields as strings. IMPORTANT: You must return a JSON object with a single "trip" key. The "trip" object must include "title", "destination", "duration", "travelStyle", and "days" array. ' + (regenerateTheme ? 'Regenerate one day around the theme "' + regenerateTheme + '" and return exactly one day.' : '');
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'You are a careful travel planner. Follow the required output format exactly. ' + prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'trip_itinerary',
          strict: true,
          schema: tripSchema,
        },
      },
      temperature: 0.7,
      reasoning_format: 'hidden',
      reasoning_effort: 'low',
      max_completion_tokens: 4000,
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content?.trim()) return res.status(502).json({ error: 'The planner returned an empty response.' });
    let parsed;
    try { parsed = JSON.parse(content); } catch {
      return res.status(502).json({ error: 'The planner returned invalid itinerary data.' });
    }
    return res.json(parsed);
  } catch (error) {
    const providerError = error.error || {};
    // Keep diagnostics useful without logging Groq's full failed_generation payload.
    console.error('Trip generation failed:', JSON.stringify({
      status: error.status || null,
      code: providerError.code || error.code || null,
      type: providerError.type || error.type || null,
      param: providerError.param || error.param || null,
      message: typeof providerError.message === 'string'
        ? providerError.message
        : (error.message || '').slice(0, 300),
    }));
    return res.status(502).json({ error: 'The trip planner could not create a complete itinerary. Please try again.' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Trip planner API listening on port ' + port));
