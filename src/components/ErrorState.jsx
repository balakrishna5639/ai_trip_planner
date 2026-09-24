import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({ error, reset }) {
  return (
    <motion.main 
      className="state error-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="warning">
        <AlertTriangle size={48} color="#ef4444" />
      </div>
      <small className="eyebrow">A SMALL DETOUR</small>
      <h2>We couldn’t map that out.</h2>
      <p>{error}</p>
      <button className="generate-button" onClick={reset}>
        <RotateCcw size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Try again
      </button>
    </motion.main>
  );
}
