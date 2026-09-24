import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, Compass, Edit3, Sparkles, Share2 } from 'lucide-react';

const destinations = [
  { name: 'Ladakh', country: 'India', season: 'Apr – Jun', look: 'ladakh' },
  { name: 'Goa', country: 'India', season: 'Nov – Feb', look: 'goa' },
  { name: 'Hampi', country: 'India', season: 'Nov – Feb', look: 'hampi' },
  { name: 'Manali', country: 'India', season: 'Oct – Feb', look: 'manali' },
  { name: 'Kerala', country: 'India', season: 'Sep – Mar', look: 'kerala' },
  { name: 'Mumbai', country: 'India', season: 'Oct – Mar', look: 'mumbai' },
];

export default function DestinationGrid({ setForm }) {
  const [destinationPage, setDestinationPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState([]);

  function toggleFavorite(name) {
    setFavorites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  }

  const features = [
    { icon: <Sparkles size={24} />, title: 'AI-powered itineraries', desc: 'Thoughtful plans, made around you' },
    { icon: <Edit3 size={24} />, title: 'Fully editable', desc: 'Make every detail yours' },
    { icon: <Compass size={24} />, title: 'Smart suggestions', desc: 'Find your local gems' },
    { icon: <Share2 size={24} />, title: 'Save & share', desc: 'Keep the plan close' }
  ];

  return (
    <>
      <div className="features" id="features">
        {features.map((feature, i) => (
          <motion.div
            className="feature"
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <section>
              <b>{feature.title}</b>
              <small>{feature.desc}</small>
            </section>
          </motion.div>
        ))}
      </div>

      <section className="popular" id="destinations">
        <header>
          <div><small className="eyebrow">MAKE SOMEWHERE YOURS</small><h2>Popular destinations</h2></div>
          <div className="popular-actions">
            <button className="view-all" onClick={() => setShowAll(!showAll)} aria-label="Toggle all destinations">
              {showAll ? 'Show less' : 'View all'}
            </button>
            {!showAll && (
              <button className="carousel-next" onClick={() => setDestinationPage((destinationPage + 1) % Math.ceil(destinations.length / 3))} aria-label="Next destinations">
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </header>
        <div className="destination-grid">
          {(showAll ? destinations : destinations.slice(destinationPage * 3, destinationPage * 3 + 3)).map((place, i) => (
            <motion.article
              className={'destination-card ' + place.look}
              key={place.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <button
                className="destination-select"
                aria-label={'Plan a trip to ' + place.name}
                onClick={() => {
                  setForm((value) => ({ ...value, to: place.name }));
                  document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
              <button
                className="favorite"
                aria-label={(favorites.includes(place.name) ? 'Remove ' : 'Favorite ') + place.name}
                aria-pressed={favorites.includes(place.name)}
                onClick={() => toggleFavorite(place.name)}
              >
                <Heart size={20} fill={favorites.includes(place.name) ? 'currentColor' : 'none'} />
              </button>
              <div className="destination-caption">
                <b>{place.name}</b><span>{place.country}</span>
                <small>▣ &nbsp;Best time: {place.season}</small>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <div className="footnote">GOOD TRIPS START WITH A LITTLE CURIOSITY <span>✳</span></div>
    </>
  );
}
