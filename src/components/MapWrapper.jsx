import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically fit bounds to all stops
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [bounds ? bounds.toBBoxString() : '', map]);
  return null;
}

export default function MapWrapper({ coords, destination, stops }) {
  // Coerce lat/lng to numbers and filter out stops that don't have valid coordinates
  const validStops = (stops || [])
    .map(s => ({ ...s, lat: parseFloat(s.lat), lng: parseFloat(s.lng) }))
    .filter(s => !isNaN(s.lat) && !isNaN(s.lng));

  // If we have stops, calculate bounds and polyline points
  let bounds = L.latLngBounds(coords ? [coords] : []);
  let polylineCoords = [];

  if (validStops.length > 0) {
    validStops.forEach(stop => {
      const pt = [stop.lat, stop.lng];
      bounds.extend(pt);
      polylineCoords.push(pt);
    });
  } else if (coords) {
    bounds = L.latLngBounds([coords]);
  }

  // If no valid stops AND no fallback coords, show nothing
  if (!coords && validStops.length === 0) return null;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginTop: '24px', zIndex: 0 }}>
      <MapContainer center={coords || [0, 0]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw lines connecting the stops */}
        {polylineCoords.length > 1 && (
          <Polyline positions={polylineCoords} color="#3b82f6" weight={4} dashArray="5, 10" />
        )}

        {/* Render markers for each stop */}
        {validStops.map((stop, i) => (
          <Marker key={stop.id || i} position={[stop.lat, stop.lng]}>
            <Tooltip permanent direction="top" offset={[0, -20]} className="custom-map-tooltip">
              <b>{i + 1}. {stop.name}</b>
            </Tooltip>
            <Popup>
              <b>{stop.name}</b><br />
              {stop.time} • {stop.cost || 'Price not found'}<br />
              <small>{stop.description}</small>
            </Popup>
          </Marker>
        ))}

        {/* Render generic destination marker if no specific stops exist yet */}
        {validStops.length === 0 && coords && (
          <Marker position={coords}>
            <Tooltip permanent direction="top" offset={[0, -20]} className="custom-map-tooltip">
              <b>{destination}</b>
            </Tooltip>
          </Marker>
        )}

        <ChangeView bounds={bounds} />
      </MapContainer>
    </div>
  );
}
