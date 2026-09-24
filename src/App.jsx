import React, { useRef, useState } from 'react';
import { generateTrip } from './lib/api.js';

const initialForm = { from: '', to: '', days: 3, style: 'Adventure', mode: 'destination' };
const styles = ['Adventure', 'Relaxation', 'Cultural', 'Budget', 'Luxury'];
const typeIcons = { culture: '🕌', food: '🍜', nature: '🌿', leisure: '🎡', adventure: '🏔️' };

export default function App() {
  const [page, setPage] = useState('input');
  const [form, setForm] = useState(initialForm);
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const requestId = useRef(0);

  async function generate(event) {
    event?.preventDefault();
    const id = ++requestId.current;
    setError('');
    setPage('loading');
    try {
      const result = await generateTrip(form, id, (value) => requestId.current === value);
      if (result && id === requestId.current) { setTrip(result); setActiveDay(0); setPage('results'); }
    } catch (e) {
      if (id === requestId.current) { setError(e.message || 'Something went wrong. Please try again.'); setPage('error'); }
    }
  }

  function updateDay(change) {
    setTrip((value) => ({ ...value, days: value.days.map((day, i) => i === activeDay ? change(day) : day) }));
  }
  function editStop(index, key, value) {
    updateDay((day) => ({ ...day, stops: day.stops.map((stop, i) => i === index ? { ...stop, [key]: value } : stop) }));
  }
  function moveStop(from, to) {
    updateDay((day) => {
      if (to < 0 || to >= day.stops.length) return day;
      const stops = [...day.stops]; const item = stops.splice(from, 1)[0]; stops.splice(to, 0, item);
      return { ...day, stops };
    });
  }
  async function regenerateDay() {
    const id = ++requestId.current;
    setPage('loading'); setError('');
    try {
      const result = await generateTrip({ ...form, days: 1, regenerateTheme: trip.days[activeDay].theme }, id, (value) => requestId.current === value);
      if (result && id === requestId.current) {
        setTrip((value) => ({ ...value, days: value.days.map((day, i) => i === activeDay ? { ...result.days[0], id: day.id, date: day.date } : day) }));
        setPage('results');
      }
    } catch (e) { if (id === requestId.current) { setError(e.message); setPage('error'); } }
  }

  return <div className={dark ? 'app dark' : 'app'}>
    <nav className="navbar"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setPage('input'); }}><b>w.</b> wayfarer</a><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? '☀️' : '◐'}</button></nav>
    {page === 'input' && <main className="landing">
      <div className="eyebrow"><i/> THE WORLD, YOUR WAY</div>
      <h1>Your next adventure<br/>starts <em>here.</em></h1>
      <p>Tell us what you love, and we’ll shape a day-by-day trip around it.<br className="desktop"/> Thoughtful plans, with room to make them yours.</p>
      <form className="form-card" onSubmit={generate}>
        <div className="mode-switch">
          <button type="button" className={form.mode === 'destination' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'destination' })}>📍 Destination places</button>
          <button type="button" className={form.mode === 'route' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'route' })}>🚗 On the route</button>
        </div>
        <div className="form-grid">
          <label>FROM<input required value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="Where are you starting?"/></label>
          <label>TO<input required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Where do you want to go?"/></label>
          <label>NUMBER OF DAYS<select value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}>{Array.from({ length: 14 }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'day' : 'days'}</option>)}</select></label>
          <label>TRAVEL STYLE<select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>{styles.map((style) => <option key={style}>{style}</option>)}</select></label>
        </div>
        <div className="field-label">PICK YOUR VIBE</div>
        <div className="chips">{styles.map((style) => <button type="button" key={style} className={form.style === style ? 'selected' : ''} onClick={() => setForm({ ...form, style })}>{style}</button>)}</div>
        <button className="generate-button" type="submit">✨ &nbsp;Generate my trip plan <span>→</span></button>
        <div className="note">✳ &nbsp;Made for the way you like to travel</div>
      </form>
      <div className="features">{[['✦','AI-powered itineraries','Thoughtful plans, made around you'],['↗','Fully editable','Make every detail yours'],['⌖','Smart suggestions','Find your local gems'],['♡','Save & share','Keep the plan close']].map(([icon,title,desc]) => <div className="feature" key={title}><i>{icon}</i><section><b>{title}</b><small>{desc}</small></section></div>)}</div>
      <div className="footnote">GOOD TRIPS START WITH A LITTLE CURIOSITY <span>✳</span></div>
    </main>}
    {page === 'loading' && <main className="state loading"><div className="plane">✈</div><small className="eyebrow">A LITTLE MAGIC IS HAPPENING</small><h2>Planning your trip to <em>{form.to}</em>...</h2><p>Finding the good spots, hidden gems, and just-right moments.</p><div className="skeletons">{[1,2,3].map((n) => <article className="skeleton" key={n}><i className="sk-title"/><i/><i className="short"/><div><b/><b/></div></article>)}</div></main>}
    {page === 'error' && <main className="state error-state"><div className="warning">⚠️</div><small className="eyebrow">A SMALL DETOUR</small><h2>We couldn’t map that out.</h2><p>{error}</p><button className="generate-button" onClick={() => setPage('input')}>🔄 &nbsp;Try again</button></main>}
    {page === 'results' && trip && <main className="results">
      <button className="back-button" onClick={() => setPage('input')}>← &nbsp;Back to search</button>
      <header className="trip-heading"><div><small className="eyebrow">✦ &nbsp;YOUR PERSONAL ITINERARY</small><h1>{trip.title}</h1><p>⌖ &nbsp;{trip.destination} <span>·</span> {trip.duration}</p></div><span className="style-badge">✧ &nbsp;{trip.travelStyle}</span></header>
      <div className="day-tabs" role="tablist">{trip.days.map((day, i) => <button role="tab" aria-selected={activeDay === i} className={activeDay === i ? 'active' : ''} key={day.id} onClick={() => setActiveDay(i)}>{day.date || 'Day ' + (i + 1)}</button>)}</div>
      {trip.days[activeDay] && <section className="day-panel"><header className="day-heading"><div><small>DAY {String(activeDay + 1).padStart(2, '0')}</small><h2>{trip.days[activeDay].theme}</h2></div><span>◷ &nbsp;{trip.days[activeDay].totalDuration}</span></header>
        {trip.days[activeDay].stops.length === 0 ? <div className="empty-day">⌖<p>No stops remaining. Add one below.</p></div> : <div className="stop-list">{trip.days[activeDay].stops.map((stop, i) => <article className={'stop-card ' + (stop.visited ? 'visited' : '')} key={stop.id} draggable onDragStart={(e) => e.dataTransfer.setData('stop', String(i))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); moveStop(Number(e.dataTransfer.getData('stop')), i); }}>
          <span className="drag-handle" title="Drag to reorder">⠿</span><div className={'stop-icon ' + stop.type}>{typeIcons[stop.type] || '✦'}</div><div className="stop-main"><div><span className="time-badge">{stop.time}</span><span className="duration-badge">◷ &nbsp;{stop.duration}</span></div><input className="stop-name" aria-label="Stop name" value={stop.name} onChange={(e) => editStop(i, 'name', e.target.value)}/><textarea aria-label="Stop description" value={stop.description} rows="2" onChange={(e) => editStop(i, 'description', e.target.value)}/><div className="stop-bottom"><span className={'type-badge ' + stop.type}>{stop.type}</span><details><summary>💡 Tips</summary><p>{stop.tips}</p></details></div></div><div className="stop-actions"><button aria-label="Mark visited" onClick={() => editStop(i, 'visited', !stop.visited)}>✓</button><button aria-label="Move up" disabled={i === 0} onClick={() => moveStop(i, i - 1)}>↑</button><button aria-label="Move down" disabled={i === trip.days[activeDay].stops.length - 1} onClick={() => moveStop(i, i + 1)}>↓</button><button aria-label="Delete stop" onClick={() => updateDay((day) => ({ ...day, stops: day.stops.filter((_, n) => n !== i) }))}>🗑</button></div>
        </article>)}</div>}
        <div className="day-actions"><button onClick={() => updateDay((day) => ({ ...day, stops: [...day.stops, { id: 'new-' + Date.now(), time: 'Anytime', name: 'New stop', description: 'Add a description...', duration: '1 hour', type: 'leisure', tips: 'Add a local tip.' }] }))}>＋ &nbsp;Add stop</button><button onClick={regenerateDay}>🔄 &nbsp;Regenerate day</button></div>
      </section>}
      <footer className="results-footer">A GOOD ITINERARY LEAVES ROOM FOR THE UNPLANNED. <span>✳</span></footer>
    </main>}
  </div>;
}
