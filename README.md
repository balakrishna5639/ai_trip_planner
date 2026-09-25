# Wayfarer Trip Planner

A responsive React and Vite itinerary planner backed by Express and Groq. The Groq API key is read only by the server.

## Run locally

1. Use Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set `GROQ_API_KEY`.
3. Run `npm install`, then `npm start`.
4. Open [http://localhost:5173](http://localhost:5173).

The Vite development server proxies `/api` requests to Express on port 3001. To run the services separately, use `npm run server` and `npm run dev` in two terminals.

## AI Usage

I mostly used ChatGPT and Copilot to get the boilerplate setup and figure out some of the CSS for the glassmorphism stuff (those blurs and shadows take forever by hand!). They also helped tweak the JSON prompt instructions so the LLM actually listens. However, I wrote the React state logic, the drag-and-drop stuff, the error handling, and the JSON validation myself because the AI tools kept messing up the race conditions and edge cases.

## Known Limitations

- The map view currently uses OpenStreetMap via an iframe, which lacks robust dynamic marker placement for each individual stop.
- For very large multi-day itineraries, the LLM may occasionally truncate its output if it exceeds token limits, though this is partially mitigated by the strict JSON schema enforced.
- Re-generating a single day does not currently re-calculate travel distances from the previous day's final stop.

## Time Spent

I spent about 7.5 hours on this. Most of that was split between getting the UI/UX right, setting up the backend so the API key wouldn't leak, writing the LLM prompt, and then pulling my hair out making sure all the error states and timeouts actually worked smoothly.
