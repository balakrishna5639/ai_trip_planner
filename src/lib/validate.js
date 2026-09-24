const required = ['id', 'time', 'name', 'description', 'duration', 'type', 'tips'];
export function validateTrip(input) {
  let data = input;
  if (typeof input === 'string') { try { data = JSON.parse(input); } catch { return null; } }
  const trip = data?.trip;
  if (!trip?.title || !trip.destination || !trip.duration || !trip.travelStyle ||
      !Array.isArray(trip.days) || !trip.days.length) return null;
  for (const day of trip.days) {
    if (!day?.id || !day.date || !day.theme || !Array.isArray(day.stops)) return null;
    for (const stop of day.stops) {
      if (!stop || !required.every((key) => typeof stop[key] === 'string')) return null;
    }
  }
  return trip;
}
