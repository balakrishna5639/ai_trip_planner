import { validateTrip } from './validate.js';

export async function generateTrip(payload, requestId, isCurrent) {
  // We don't want people waiting forever if the LLM hangs, so let's kill it after 10s
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), 
      signal: controller.signal,
    });

    if (!response.ok) {
      // Try to parse the backend error if we can, otherwise use a generic one
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'The planner could not create your trip.');
    }

    const text = await response.text();
    if (!text.trim()) throw new Error('The planner returned an empty response.');

    let parsed;
    try { 
      parsed = JSON.parse(text); 
    } catch { 
      // This usually happens if the AI hallucinates outside the JSON object
      throw new Error('The planner returned an unreadable itinerary.'); 
    }

    // Stop here if the user clicked generate again while we were waiting
    if (!isCurrent(requestId)) return null;
    const trip = validateTrip(parsed);
    if (!trip) throw new Error('The itinerary was incomplete. Please try again.');
    return trip;
  } catch (error) {
    if (!isCurrent(requestId)) return null;
    if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}
