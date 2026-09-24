# Wayfarer Trip Planner

A responsive React and Vite itinerary planner backed by Express and Groq. The Groq API key is read only by the server.

## Run locally

1. Use Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set `GROQ_API_KEY`.
3. Run `npm install`, then `npm start`.
4. Open [http://localhost:5173](http://localhost:5173).

The Vite development server proxies `/api` requests to Express on port 3001. To run the services separately, use `npm run server` and `npm run dev` in two terminals.

## Included

- Destination or on-the-route planning, 1–14 days, and five travel styles
- Itinerary editing, stop reordering, visited state, tips, adding/deleting stops, and day regeneration
- Loading skeletons, timeout and network errors, stale request protection, and strict response validation
- Responsive layout and dark mode
