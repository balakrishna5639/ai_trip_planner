import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

const styles = ['Adventure', 'Relaxation', 'Cultural', 'Budget', 'Luxury'];

export default function Hero({ form, setForm, generate }) {
  return (
    <motion.main 
      className="landing" 
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-scene">
        <div className="hero-content">
          <motion.section 
            className="hero-copy"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="eyebrow">YOUR NEXT ADVENTURE</div>
            <h1>The World is Waiting<br/><span>Discover It.</span></h1>
            <p>Tell us your travel preferences and our AI will create a personalized, day-by-day itinerary — fully editable, just the way you like it.</p>
          </motion.section>

          <motion.form 
            className="form-card" 
            onSubmit={generate}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="mode-switch">
              <button type="button" className={form.mode === 'destination' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'destination' })}>
                <MapPin size={16} /> Destination
              </button>
              <button type="button" className={form.mode === 'route' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'route' })}>
                <Navigation size={16} /> Route
              </button>
            </div>
            
            <div className={'form-grid ' + (form.mode === 'destination' ? 'destination-mode' : '')}>
              {form.mode === 'route' && (
                <label>FROM
                  <input required value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="Starting city..."/>
                </label>
              )}
              <label>TO
                <input required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Where to?"/>
              </label>
              <label>DURATION
                <select value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}>
                  {Array.from({ length: 14 }, (_, i) => (
                    <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'day' : 'days'}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="field-label">TRAVEL STYLE</div>
            <div className="chips">
              {styles.map((style) => (
                <button 
                  type="button" 
                  key={style} 
                  className={form.style === style ? 'selected' : ''} 
                  onClick={() => setForm({ ...form, style })}
                >
                  {style}
                </button>
              ))}
            </div>
            
            <motion.button 
              className="generate-button" 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} /> Generate Itinerary
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.main>
  );
}
