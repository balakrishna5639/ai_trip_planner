import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function LoadingState({ destination }) {
  return (
    <motion.main 
      className="state loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="plane"
        animate={{ y: [-5, 5, -5], rotate: [5, 0, 5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plane size={24} />
      </motion.div>
      <small className="eyebrow">A LITTLE MAGIC IS HAPPENING</small>
      <h2>Planning your trip to <em>{destination}</em>...</h2>
      <p>Finding the good spots, hidden gems, and just-right moments.</p>
      
      <div className="skeletons">
        {[1,2,3].map((n, i) => (
          <motion.article 
            className="skeleton" 
            key={n}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
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
