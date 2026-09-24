import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

app.post('/api/generate', async (req, res) => {
  const { from, to, days, style, mode, regenerateTheme } = req.body || {};
  if (!from?.trim() || !to?.trim() || !Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 14 || !style) {
    return res.status(400).json({ error: 'Please enter a starting location, destination, trip length, and travel style.' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Add GROQ_API_KEY to your .env file, then restart the server.' });
  }
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = 'Return only valid JSON matching this shape: {trip:{title,destination,duration,travelStyle,days:[{id,date,theme,totalDuration,stops:[{id,time,name,description,duration,type,tips}]}]}}. Stop type must be culture, food, nature, leisure, or adventure. Create realistic suggestions, concise descriptions and practical tips, with at least 3 stops per day. Trip details: from ' + from + ' to ' + to + ', ' + days + ' days, style ' + style + ', ' + (mode === 'route' ? 'places along the route' : 'destination places') + '. ' + (regenerateTheme ? 'Regenerate one day inspired by this theme: ' + regenerateTheme + '. Return one day only.' : '');
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are a careful travel planner. Return JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content?.trim()) return res.status(502).json({ error: 'The planner returned an empty response.' });
    let parsed;
    try { parsed = JSON.parse(content); } catch {
      return res.status(502).json({ error: 'The planner returned invalid itinerary data.' });
    }
    return res.json(parsed);
  } catch (error) {
    console.error('Trip generation failed:', error.message);
    return res.status(502).json({ error: 'We could not reach the trip planner. Please try again.' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Trip planner API listening on port ' + port));
