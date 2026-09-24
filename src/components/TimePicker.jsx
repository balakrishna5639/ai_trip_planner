import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function TimePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Robust parsing to handle both '14:30' and '02:30 PM' formats
  let h24 = 9, m = 0;
  if (value) {
    const match = value.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      m = parseInt(match[2], 10);
      let ampm = match[3] ? match[3].toUpperCase() : '';
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      h24 = hours;
    }
  }
  
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const hours = Array.from({length: 12}, (_, i) => i + 1);
  const minutes = Array.from({length: 60}, (_, i) => i);
  const periods = ['AM', 'PM'];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (containerRef.current) {
          const activeItems = containerRef.current.querySelectorAll('.time-opt.active');
          activeItems.forEach(item => {
            item.scrollIntoView({ block: 'center', behavior: 'instant' });
          });
        }
      }, 10);
    }
  }, [isOpen]);

  const updateTime = (newH12, newM, newAmpm) => {
    let newH24 = newH12;
    if (newAmpm === 'PM' && newH12 < 12) newH24 += 12;
    if (newAmpm === 'AM' && newH12 === 12) newH24 = 0;
    
    const formatted = `${newH24.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    onChange(formatted);
  };

  const displayTime = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;

  return (
    <div className="custom-time-picker" ref={containerRef}>
      <button 
        type="button" 
        className="time-editor-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select time"
      >
        {displayTime}
        <Clock size={14} style={{ marginLeft: 6, opacity: 0.7 }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="time-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="time-col">
              {hours.map(h => (
                <div 
                  key={h} 
                  className={`time-opt ${h === h12 ? 'active' : ''}`}
                  onClick={() => updateTime(h, m, ampm)}
                >
                  {h.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            <div className="time-col">
              {minutes.map(min => (
                <div 
                  key={min} 
                  className={`time-opt ${min === m ? 'active' : ''}`}
                  onClick={() => updateTime(h12, min, ampm)}
                >
                  {min.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            <div className="time-col">
              {periods.map(p => (
                <div 
                  key={p} 
                  className={`time-opt ${p === ampm ? 'active' : ''}`}
                  onClick={() => updateTime(h12, m, p)}
                >
                  {p}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
