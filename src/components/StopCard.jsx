import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, CheckCircle, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import TimePicker from './TimePicker';

const typeIcons = { culture: '🕌', food: '🍜', nature: '🌿', leisure: '🎡', adventure: '🏔️' };

export default function StopCard({ stop, index, totalStops, editStop, moveStop, deleteStop }) {
  return (
    <motion.article 
      className={'stop-card ' + (stop.visited ? 'visited' : '')}
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      draggable 
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('stopIndex', String(index)); }} 
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} 
      onDrop={(e) => { e.preventDefault(); const from = e.dataTransfer.getData('stopIndex'); if (from) moveStop(Number(from), index); }}
    >
      <span className="drag-handle" title="Drag to reorder">
        <GripVertical size={16} />
      </span>
      
      <div className={'stop-icon ' + stop.type}>{typeIcons[stop.type] || '✦'}</div>
      
      <div className="stop-main">
        <div>
          <TimePicker 
            value={stop.time} 
            onChange={(val) => editStop(index, 'time', val)} 
          />
          <span className="duration-badge">◷ &nbsp;{stop.duration}</span>
        </div>
        
        <input 
          className="stop-name" 
          aria-label="Stop name" 
          value={stop.name} 
          onChange={(e) => editStop(index, 'name', e.target.value)}
        />
        
        <textarea 
          aria-label="Stop description" 
          value={stop.description} 
          rows="2" 
          onChange={(e) => editStop(index, 'description', e.target.value)}
        />
        
        <div className="stop-bottom">
          <span className={'type-badge ' + stop.type}>{stop.type}</span>
          <details>
            <summary>💡 Tips</summary>
            <p>{stop.tips}</p>
          </details>
        </div>
      </div>

      <div className="stop-actions">
        <button aria-label="Mark visited" onClick={() => editStop(index, 'visited', !stop.visited)}>
          <CheckCircle size={16} color={stop.visited ? '#10b981' : 'currentColor'} />
        </button>
        <button aria-label="Move up" disabled={index === 0} onClick={() => moveStop(index, index - 1)}>
          <ArrowUp size={16} />
        </button>
        <button aria-label="Move down" disabled={index === totalStops - 1} onClick={() => moveStop(index, index + 1)}>
          <ArrowDown size={16} />
        </button>
        <button aria-label="Delete stop" onClick={() => deleteStop(index)}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.article>
  );
}
