import { useRef, useEffect, useState } from 'react';

// @ts-ignore
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import './USGSMap.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbXBhdHRlcm5hZyIsImEiOiJja21udWtzOWYxc3FhMm9yd3k0azNhc3NlIn0.8AK6rDX4v_85w2hM-PxmMQ';

function USGSMap() {
  const mapContainer = useRef(null);
  const map: Map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  // const [newCoord, setNewCoord] = useState({lng, lat: ""});

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
  }, [lng, lat]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, [lng, lat]);

  // var marker2 = new mapboxgl.Marker({ color: 'black', rotation: 45 })
  // .setLngLat([12.65147, 55.608166])
  // .addTo(map);

  return (
    <div className="usgs-map-container">
        <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="map-container" />
        <form 
          className="input-form"
          // onSubmit={() => handleSubmit()}
        >
          Enter your location
          <label>
            Lng: 
            <input
              type="text"
              name="Lat"
              onChange={() => setLng(-122.44310185429026)}
            />
          </label>
          <label>
            Lat: 
            <input
              type="text"
              name="Lat"
              onChange={() => setLat(37.76467403869326)}
            />
          </label>
          
          <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default USGSMap;
