import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

export default function LoadingState({ destination }) {
  return (
    <motion.main 
      className="state loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '160px' }}
    >
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
        {/* Pulsating background rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              opacity: 0
            }}
            animate={{
              scale: [1, 2],
              opacity: [0.8, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
          />
        ))}
        
        {/* Center Icon */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Compass size={40} />
        </motion.div>
      </div>

      <small className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>A LITTLE MAGIC IS HAPPENING</small>
      <h2 style={{ textAlign: 'center' }}>Planning your trip to <em>{destination}</em>...</h2>
      <p style={{ textAlign: 'center' }}>Finding the good spots, hidden gems, and just-right moments.</p>
      
      <div className="skeletons" style={{ marginTop: '40px' }}>
        {[1,2,3].map((n, i) => (
          <motion.article 
            className="skeleton" 
            key={n}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2, repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
          >
            <i className="sk-title"/>
            <i/>
            <i className="short"/>
            <div><b/><b/></div>
          </motion.article>
        ))}
      </div>
    </motion.main>
  );
}
