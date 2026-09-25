import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, ArrowLeft, Plus, RefreshCw, X, Calendar } from 'lucide-react';
import StopCard from './StopCard';
import MapWrapper from './MapWrapper';

export default function Results({ trip, coords, activeDay, setActiveDay, notice, setNotice, setPage, shareTrip, regenerateDay, setShowAddStop, editStop, moveStop, deleteStop }) {
  const currentDay = trip.days[activeDay];

  return (
    <motion.main 
      className="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button className="back-button" onClick={() => setPage('input')}>
        <ArrowLeft size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Back to search
      </button>

      <header className="trip-heading">
        <div>
          <small className="eyebrow">✦ &nbsp;YOUR PERSONAL ITINERARY</small>
          <motion.h1 layoutId="trip-title">{trip.title}</motion.h1>
          <p>⌖ &nbsp;{trip.destination} <span>·</span> {trip.duration}</p>
        </div>
        <div className="trip-tools">
          <span className="style-badge">✧ &nbsp;{trip.travelStyle}</span>
          <button onClick={shareTrip}>
            <Share size={14} style={{ display: 'inline', marginRight: 4 }} /> Share
          </button>
        </div>
      </header>

      <MapWrapper coords={coords} destination={trip.destination} stops={currentDay.stops} />

      <AnimatePresence>
        {notice && (
          <motion.div 
            className="notice" 
            role="status"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            {notice}
            <button aria-label="Dismiss message" onClick={() => setNotice('')}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="day-tabs" role="tablist">
        {trip.days.map((day, i) => (
          <button 
            role="tab" 
            aria-selected={activeDay === i} 
            className={activeDay === i ? 'active' : ''} 
            key={day.id} 
            onClick={() => setActiveDay(i)}
          >
            {day.date || 'Day ' + (i + 1)}
            {activeDay === i && (
              <motion.div 
                className="tab-indicator" 
                layoutId="activeTab"
                style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, borderRadius: 3, background: 'var(--gradient)' }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentDay && (
          <motion.section 
            className="day-panel"
            key={activeDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <header className="day-heading">
              <div>
                <small>DAY {String(activeDay + 1).padStart(2, '0')}</small>
                <h2>{currentDay.theme}</h2>
              </div>
              <span>◷ &nbsp;{currentDay.totalDuration} &nbsp; | &nbsp; 💰 {currentDay.totalCost || 'Free'}</span>
            </header>

            {currentDay.stops.length === 0 ? (
              <div className="empty-day">
                ⌖<p>No stops remaining. Add one below.</p>
              </div>
            ) : (
              <motion.div className="stop-list" layout>
                <AnimatePresence>
                  {currentDay.stops.map((stop, i) => (
                    <StopCard 
                      key={stop.id} 
                      stop={stop} 
                      index={i} 
                      totalStops={currentDay.stops.length}
                      editStop={editStop}
                      moveStop={moveStop}
                      deleteStop={deleteStop}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="day-actions">
              <button onClick={() => setShowAddStop(true)}>
                <Plus size={14} style={{ display: 'inline', marginRight: 4 }} /> Add stop
              </button>
              <button onClick={regenerateDay}>
                <RefreshCw size={14} style={{ display: 'inline', marginRight: 4 }} /> Regenerate day
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="results-footer">A GOOD ITINERARY LEAVES ROOM FOR THE UNPLANNED. <span>✳</span></footer>
    </motion.main>
  );
}
