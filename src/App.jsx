import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { generateTrip } from './lib/api.js';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DestinationGrid from './components/DestinationGrid';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import Results from './components/Results';
import AddStopModal from './components/AddStopModal';

// CSS
import './AppExtra.css';
import './Cinematic.css';
import './ResponsiveGlass.css';

const initialForm = { from: '', to: '', days: 3, style: 'Adventure', mode: 'destination' };
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
  const [notice, setNotice] = useState('');
  const requestId = useRef(0);

  async function generate(event) {
    event?.preventDefault();
    const id = ++requestId.current;
    setError('');
    setPage('loading');
    try {
      const payload = { ...form, from: form.mode === 'route' ? form.from : '' };
      const result = await generateTrip(payload, id, (value) => requestId.current === value);
      if (result && id === requestId.current) { 
        setTrip(result); 
        setActiveDay(0); 
        setPage('results'); 
      }
    } catch (e) {
      if (id === requestId.current) { 
        setError(e.message || 'Something went wrong. Please try again.'); 
        setPage('error'); 
      }
    }
  }

  function updateDay(change) {
    setTrip((value) => ({ 
      ...value, 
      days: value.days.map((day, i) => {
        if (i !== activeDay) return day;
        let newDay = change(day);
        
        const parseTimeDecimal = (t) => {
          if (!t) return 0;
          if (/^\d{2}:\d{2}$/.test(t)) {
            const p = t.split(':');
            return parseInt(p[0], 10) + parseInt(p[1], 10) / 60;
          }
          const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (!m) return 0;
          let h = parseInt(m[1], 10);
          if (m[3] && m[3].toUpperCase() === 'PM' && h < 12) h += 12;
          if (m[3] && m[3].toUpperCase() === 'AM' && h === 12) h = 0;
          return h + parseInt(m[2], 10) / 60;
        };

        // Auto-sort stops chronologically
        newDay.stops = [...newDay.stops].sort((a, b) => parseTimeDecimal(a.time) - parseTimeDecimal(b.time));

        // Recalculate total duration
        if (newDay.stops.length > 0) {
          const first = newDay.stops[0];
          const last = newDay.stops[newDay.stops.length - 1];
          const t1 = parseTimeDecimal(first.time);
          const t2 = parseTimeDecimal(last.time);
          
          let lastDurationHours = 1; 
          const durMatch = last.duration ? last.duration.match(/([\d.]+)/) : null;
          if (durMatch) {
            lastDurationHours = parseFloat(durMatch[1]);
            if (last.duration.toLowerCase().includes('min')) lastDurationHours /= 60;
          }
          
          let diffHours = t2 - t1 + lastDurationHours;
          if (diffHours < 0) diffHours += 24; // Handle trips crossing midnight
          
          let hours = Math.floor(diffHours);
          let mins = Math.round((diffHours - hours) * 60);
          if (mins === 60) { hours += 1; mins = 0; }
          
          if (hours === 0) newDay.totalDuration = mins + 'm';
          else if (mins === 0) newDay.totalDuration = hours + 'h';
          else newDay.totalDuration = hours + 'h ' + mins + 'm';
        } else {
          newDay.totalDuration = '0h';
        }

        return newDay;
      }) 
    }));
  }

  function editStop(index, key, value) {
    updateDay((day) => {
      // Find the stop by its id because index might change if we sort, but wait, 
      // editStop is called with the current render index. 
      // The current render index maps perfectly to day.stops before updateDay modifies it.
      return { ...day, stops: day.stops.map((stop, i) => i === index ? { ...stop, [key]: value } : stop) };
    });
  }

  function moveStop(from, to) {
    updateDay((day) => {
      if (from === to) return day;
      if (to < 0 || to >= day.stops.length) return day;
      
      const stops = [...day.stops]; 
      const originalTimes = stops.map(s => s.time);
      
      const item = stops.splice(from, 1)[0]; 
      stops.splice(to, 0, item);
      
      const newStops = stops.map((stop, index) => ({
        ...stop,
        time: originalTimes[index]
      }));
      
      return { ...day, stops: newStops };
    });
  }

  function deleteStop(index) {
    updateDay((day) => ({ ...day, stops: day.stops.filter((_, n) => n !== index) }));
  }

  function addStop(event) {
    event.preventDefault();
    updateDay((day) => ({ ...day, stops: [...day.stops, { ...newStop, id: 'stop-' + Date.now() }] }));
    setNewStop(blankStop);
    setShowAddStop(false);
  }

  async function shareTrip() {
    const text = trip.title + ' — ' + trip.destination + ', ' + trip.duration;
    try {
      if (navigator.share) await navigator.share({ title: trip.title, text });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setNotice('Trip details copied to clipboard.');
      } else setNotice('Sharing is not available in this browser.');
    } catch (e) {
      if (e.name !== 'AbortError') setNotice('Could not share this trip. Please try again.');
    }
  }

  async function regenerateDay() {
    const id = ++requestId.current;
    setPage('loading'); 
    setError('');
    try {
      const result = await generateTrip({ ...form, days: 1, regenerateTheme: trip.days[activeDay].theme }, id, (value) => requestId.current === value);
      if (result && id === requestId.current) {
        setTrip((value) => ({ ...value, days: value.days.map((day, i) => i === activeDay ? { ...result.days[0], id: day.id, date: day.date } : day) }));
        setPage('results');
      }
    } catch (e) { 
      if (id === requestId.current) { setError(e.message); setPage('error'); } 
    }
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <Navbar dark={dark} setDark={setDark} setPage={setPage} />
      
      <AnimatePresence mode="wait">
        {page === 'input' && (
          <div key="input">
            <Hero form={form} setForm={setForm} generate={generate} />
            <DestinationGrid setForm={setForm} />
          </div>
        )}
        
        {page === 'loading' && (
          <LoadingState key="loading" destination={form.to} />
        )}
        
        {page === 'error' && (
          <ErrorState key="error" error={error} reset={() => setPage('input')} />
        )}
        
        {page === 'results' && trip && (
          <Results 
            key="results"
            trip={trip}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            notice={notice}
            setNotice={setNotice}
            setPage={setPage}
            shareTrip={shareTrip}
            regenerateDay={regenerateDay}
            setShowAddStop={setShowAddStop}
            editStop={editStop}
            moveStop={moveStop}
            deleteStop={deleteStop}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddStop && (
          <AddStopModal 
            newStop={newStop} 
            setNewStop={setNewStop} 
            setShowAddStop={setShowAddStop} 
            addStop={addStop} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
