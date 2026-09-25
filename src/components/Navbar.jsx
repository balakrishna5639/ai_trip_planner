import React from 'react';
import { Moon, Sun, User, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ dark, setDark, page, setPage }) {
  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <a className="brand" href="#home" onClick={() => setPage('input')}>
        <b><Compass size={18} /></b> Trip<span>Planner</span>
      </a>
      
      <div className="nav-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          className="theme-toggle" 
          onClick={() => setDark(!dark)} 
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </motion.nav>
  );
}
