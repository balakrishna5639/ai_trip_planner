import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import TimePicker from './TimePicker';

const typeIcons = { culture: '🕌', food: '🍜', nature: '🌿', leisure: '🎡', adventure: '🏔️' };

export default function AddStopModal({ newStop, setNewStop, setShowAddStop, addStop }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAddStop(false); }}
    >
      <motion.section
        className="stop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <button className="modal-close" onClick={() => setShowAddStop(false)} aria-label="Close dialog">
          <X size={24} />
        </button>
        <small className="eyebrow">MAKE IT YOURS</small>
        <h2 id="stop-modal-title">Add a stop</h2>
        <p>Give this place a little detail so it fits your day.</p>

        <form onSubmit={addStop}>
          <label>PLACE NAME
            <input autoFocus required value={newStop.name} onChange={(e) => setNewStop({ ...newStop, name: e.target.value })} placeholder="e.g. A quiet café by the river" />
          </label>
          <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <label>TIME
              <TimePicker 
                value={newStop.time} 
                onChange={(val) => setNewStop({ ...newStop, time: val })} 
              />
            </label>
            <label>DURATION
              <input required value={newStop.duration} onChange={(e) => setNewStop({ ...newStop, duration: e.target.value })} placeholder="1 hour" />
            </label>
            <label>COST
              <input value={newStop.cost || '$0'} onChange={(e) => setNewStop({ ...newStop, cost: e.target.value })} placeholder="$10" />
            </label>
          </div>
          <label>TYPE
            <select value={newStop.type} onChange={(e) => setNewStop({ ...newStop, type: e.target.value })}>
              {Object.keys(typeIcons).map((type) => (
                <option key={type} value={type}>
                  {typeIcons[type]} {type[0].toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>DESCRIPTION
            <textarea required rows="3" value={newStop.description} onChange={(e) => setNewStop({ ...newStop, description: e.target.value })} placeholder="What would you like to remember?" />
          </label>
          <label>TIP (OPTIONAL)
            <textarea rows="2" value={newStop.tips} onChange={(e) => setNewStop({ ...newStop, tips: e.target.value })} placeholder="A helpful local tip" />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowAddStop(false)}>Cancel</button>
            <button className="modal-save" type="submit">Add to my day <span>→</span></button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}
