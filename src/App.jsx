import React, { useRef, useState } from 'react';
import { generateTrip } from './lib/api.js';
import './AppExtra.css';

const initialForm = { from: '', to: '', days: 3, style: 'Adventure', mode: 'destination' };
const styles = ['Adventure', 'Relaxation', 'Cultural', 'Budget', 'Luxury'];
const typeIcons = { culture: '🕌', food: '🍜', nature: '🌿', leisure: '🎡', adventure: '🏔️' };
const destinations = [
  { name: 'Ladakh', country: 'India', season: 'Apr – Jun', look: 'ladakh' },
  { name: 'Goa', country: 'India', season: 'Nov – Feb', look: 'goa' },
  { name: 'Hampi', country: 'India', season: 'Nov – Feb', look: 'hampi' },
  { name: 'Manali', country: 'India', season: 'Oct – Feb', look: 'manali' },
  { name: 'Kerala', country: 'India', season: 'Sep – Mar', look: 'kerala' },
  { name: 'Mumbai', country: 'India', season: 'Oct – Mar', look: 'mumbai' },
];
const blankStop = { name: '', time: '9:00 AM', duration: '1 hour', type: 'leisure', description: '', tips: '' };

export default function App() {
  const [page, setPage] = useState('input');
  const [form, setForm] = useState(initialForm);
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStop, setNewStop] = useState(blankStop);
  const [favorites, setFavorites] = useState([]);
  const [destinationPage, setDestinationPage] = useState(0);
  const requestId = useRef(0);

  async function generate(event) {
    event?.preventDefault();
    const id = ++requestId.current;
    setError('');
    setPage('loading');
    try {
      const payload = { ...form, from: form.mode === 'route' ? form.from : '' };
      const result = await generateTrip(payload, id, (value) => requestId.current === value);
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
  function addStop(event) {
    event.preventDefault();
    updateDay((day) => ({ ...day, stops: [...day.stops, { ...newStop, id: 'stop-' + Date.now() }] }));
    setNewStop(blankStop);
    setShowAddStop(false);
  }
  function toggleFavorite(name) {
    setFavorites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  }
  async function shareTrip() {
    const text = trip.title + ' — ' + trip.destination + ', ' + trip.duration;
    if (navigator.share) await navigator.share({ title: trip.title, text });
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      window.alert('Trip details copied to clipboard.');
    }
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
    <nav className="navbar"><a className="brand" href="#home" onClick={() => setPage('input')}><b>➤</b> Trip<span>Planner</span></a><div className="nav-links"><a href="#home" onClick={() => setPage('input')}>Home</a><a href="#destinations" onClick={() => setPage('input')}>Destinations</a><a href="#features" onClick={() => setPage('input')}>Travel guide</a></div><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? '☀️' : '☼'}</button><button className="profile-button" aria-label="Profile">●</button></nav>
    {page === 'input' && <main className="landing" id="home">
      <div className="hero-scene">
      <section className="hero-copy"><div className="eyebrow"><i/> YOUR NEXT ADVENTURE</div>
      <h1>Your Next Adventure<br/><span>Starts Here <b>✦</b></span></h1>
      <p>Tell us your travel preferences and our AI will create a personalized, day-by-day itinerary — fully editable, just the way you like it.</p>
      </section>
      <aside className="trail-sign" aria-label="Explore, discover, plan, travel"><small>Good trips<br/>start here</small>{['Explore','Discover','Plan','Travel'].map((word, i) => <div key={word} className={'sign sign-' + i}>{word}<span>{['⌖','✦','▣','◎'][i]}</span></div>)}<b>↙</b></aside>
      <form className="form-card" onSubmit={generate}>
        <div className="mode-switch">
          <button type="button" className={form.mode === 'destination' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'destination' })}>📍 Destination places</button>
          <button type="button" className={form.mode === 'route' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'route' })}>🚗 On the route</button>
        </div>
        <div className={'form-grid ' + (form.mode === 'destination' ? 'destination-mode' : '')}>
          {form.mode === 'route' && <label>FROM<input required value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="Where are you starting?"/></label>}
          <label>TO<input required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Where do you want to go?"/></label>
          <label>NUMBER OF DAYS<select value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}>{Array.from({ length: 14 }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'day' : 'days'}</option>)}</select></label>
          <label>TRAVEL STYLE<select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>{styles.map((style) => <option key={style}>{style}</option>)}</select></label>
        </div>
        <div className="field-label">PICK YOUR VIBE</div>
        <div className="chips">{styles.map((style) => <button type="button" key={style} className={form.style === style ? 'selected' : ''} onClick={() => setForm({ ...form, style })}>{style}</button>)}</div>
        <button className="generate-button" type="submit">✨ &nbsp;Generate my trip plan <span>→</span></button>
        <div className="note">✳ &nbsp;Made for the way you like to travel</div>
      </form>
      </div>
      <div className="features" id="features">{[['✦','AI-powered itineraries','Thoughtful plans, made around you'],['↗','Fully editable','Make every detail yours'],['⌖','Smart suggestions','Find your local gems'],['♡','Save & share','Keep the plan close']].map(([icon,title,desc]) => <div className="feature" key={title}><i>{icon}</i><section><b>{title}</b><small>{desc}</small></section></div>)}</div>
      <section className="popular" id="destinations"><header><div><small>MAKE SOMEWHERE YOURS</small><h2>Popular destinations</h2></div><div className="popular-actions"><button onClick={() => setDestinationPage((destinationPage + 1) % 2)} aria-label="Show more destinations">View all <span>→</span></button><button className="carousel-next" onClick={() => setDestinationPage((destinationPage + 1) % 2)} aria-label="Next destinations">›</button></div></header><div className="destination-grid">{destinations.slice(destinationPage * 3, destinationPage * 3 + 3).map((place) => <article className={'destination-card ' + place.look} key={place.name} onClick={() => setForm((value) => ({ ...value, to: place.name }))} role="button" tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && setForm((value) => ({ ...value, to: place.name }))}><button className="favorite" aria-label={'Favorite ' + place.name} onClick={(e) => { e.stopPropagation(); toggleFavorite(place.name); }}>{favorites.includes(place.name) ? '♥' : '♡'}</button><div className="destination-caption"><b>{place.name}</b><span>{place.country}</span><small>▣ &nbsp;Best time: {place.season}</small></div></article>)}</div></section>
      <div className="footnote">GOOD TRIPS START WITH A LITTLE CURIOSITY <span>✳</span></div>
    </main>}
    {page === 'loading' && <main className="state loading"><div className="plane">✈</div><small className="eyebrow">A LITTLE MAGIC IS HAPPENING</small><h2>Planning your trip to <em>{form.to}</em>...</h2><p>Finding the good spots, hidden gems, and just-right moments.</p><div className="skeletons">{[1,2,3].map((n) => <article className="skeleton" key={n}><i className="sk-title"/><i/><i className="short"/><div><b/><b/></div></article>)}</div></main>}
    {page === 'error' && <main className="state error-state"><div className="warning">⚠️</div><small className="eyebrow">A SMALL DETOUR</small><h2>We couldn’t map that out.</h2><p>{error}</p><button className="generate-button" onClick={() => setPage('input')}>🔄 &nbsp;Try again</button></main>}
    {page === 'results' && trip && <main className="results">
      <button className="back-button" onClick={() => setPage('input')}>← &nbsp;Back to search</button>
      <header className="trip-heading"><div><small className="eyebrow">✦ &nbsp;YOUR PERSONAL ITINERARY</small><h1>{trip.title}</h1><p>⌖ &nbsp;{trip.destination} <span>·</span> {trip.duration}</p></div><div className="trip-tools"><span className="style-badge">✧ &nbsp;{trip.travelStyle}</span><button onClick={shareTrip}>↗ &nbsp;Share</button></div></header>
      <div className="day-tabs" role="tablist">{trip.days.map((day, i) => <button role="tab" aria-selected={activeDay === i} className={activeDay === i ? 'active' : ''} key={day.id} onClick={() => setActiveDay(i)}>{day.date || 'Day ' + (i + 1)}</button>)}</div>
      {trip.days[activeDay] && <section className="day-panel"><header className="day-heading"><div><small>DAY {String(activeDay + 1).padStart(2, '0')}</small><h2>{trip.days[activeDay].theme}</h2></div><span>◷ &nbsp;{trip.days[activeDay].totalDuration}</span></header>
        {trip.days[activeDay].stops.length === 0 ? <div className="empty-day">⌖<p>No stops remaining. Add one below.</p></div> : <div className="stop-list">{trip.days[activeDay].stops.map((stop, i) => <article className={'stop-card ' + (stop.visited ? 'visited' : '')} key={stop.id} draggable onDragStart={(e) => e.dataTransfer.setData('stop', String(i))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); moveStop(Number(e.dataTransfer.getData('stop')), i); }}>
          <span className="drag-handle" title="Drag to reorder">⠿</span><div className={'stop-icon ' + stop.type}>{typeIcons[stop.type] || '✦'}</div><div className="stop-main"><div><input className="time-editor" aria-label="Edit stop time" value={stop.time} onChange={(e) => editStop(i, 'time', e.target.value)} placeholder="9:00 AM"/><span className="duration-badge">◷ &nbsp;{stop.duration}</span></div><input className="stop-name" aria-label="Stop name" value={stop.name} onChange={(e) => editStop(i, 'name', e.target.value)}/><textarea aria-label="Stop description" value={stop.description} rows="2" onChange={(e) => editStop(i, 'description', e.target.value)}/><div className="stop-bottom"><span className={'type-badge ' + stop.type}>{stop.type}</span><details><summary>💡 Tips</summary><p>{stop.tips}</p></details></div></div><div className="stop-actions"><button aria-label="Mark visited" onClick={() => editStop(i, 'visited', !stop.visited)}>✓</button><button aria-label="Move up" disabled={i === 0} onClick={() => moveStop(i, i - 1)}>↑</button><button aria-label="Move down" disabled={i === trip.days[activeDay].stops.length - 1} onClick={() => moveStop(i, i + 1)}>↓</button><button aria-label="Delete stop" onClick={() => updateDay((day) => ({ ...day, stops: day.stops.filter((_, n) => n !== i) }))}>🗑</button></div>
        </article>)}</div>}
        <div className="day-actions"><button onClick={() => setShowAddStop(true)}>＋ &nbsp;Add stop</button><button onClick={regenerateDay}>🔄 &nbsp;Regenerate day</button></div>
      </section>}
      <footer className="results-footer">A GOOD ITINERARY LEAVES ROOM FOR THE UNPLANNED. <span>✳</span></footer>
    </main>}
    {showAddStop && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAddStop(false); }}><section className="stop-modal" role="dialog" aria-modal="true" aria-labelledby="stop-modal-title"><button className="modal-close" onClick={() => setShowAddStop(false)} aria-label="Close dialog">×</button><small className="eyebrow">MAKE IT YOURS</small><h2 id="stop-modal-title">Add a stop</h2><p>Give this place a little detail so it fits your day.</p><form onSubmit={addStop}><label>PLACE NAME<input autoFocus required value={newStop.name} onChange={(e) => setNewStop({ ...newStop, name: e.target.value })} placeholder="e.g. A quiet café by the river"/></label><div className="modal-row"><label>TIME<input required value={newStop.time} onChange={(e) => setNewStop({ ...newStop, time: e.target.value })} placeholder="9:00 AM"/></label><label>DURATION<input required value={newStop.duration} onChange={(e) => setNewStop({ ...newStop, duration: e.target.value })} placeholder="1 hour"/></label></div><label>TYPE<select value={newStop.type} onChange={(e) => setNewStop({ ...newStop, type: e.target.value })}>{Object.keys(typeIcons).map((type) => <option key={type} value={type}>{typeIcons[type]} {type[0].toUpperCase() + type.slice(1)}</option>)}</select></label><label>DESCRIPTION<textarea required rows="3" value={newStop.description} onChange={(e) => setNewStop({ ...newStop, description: e.target.value })} placeholder="What would you like to remember?"/></label><label>TIP (OPTIONAL)<textarea rows="2" value={newStop.tips} onChange={(e) => setNewStop({ ...newStop, tips: e.target.value })} placeholder="A helpful local tip"/></label><div className="modal-actions"><button type="button" onClick={() => setShowAddStop(false)}>Cancel</button><button className="modal-save" type="submit">Add to my day <span>→</span></button></div></form></section></div>}
  </div>;
}
