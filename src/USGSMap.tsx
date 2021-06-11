import React, { useRef, useEffect, useState} from 'react';
// @ts-ignore
import mapboxgl, { Map, MapboxEvent } from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './USGSMap.css';
import countriesJSON from './data/countries.json';
import earthquakesJSON from './data/earthquakes.json';
import * as Turf from "@turf/turf";
import { getPopupHTML, getMapLegend } from './helper';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbXBhdHRlcm5hZyIsImEiOiJja21udWtzOWYxc3FhMm9yd3k0azNhc3NlIn0.8AK6rDX4v_85w2hM-PxmMQ';

function USGSMap() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState<Map>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2.5);
  const [markerInfo, setMarkerInfo] = useState(null);
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    const map: Map= new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    map.on('load', () => {
      map.addSource('countries', {
        type: 'geojson',
        data: countriesJSON
      });

      map.addSource('earthquakes', {
        type: 'geojson',
        data: earthquakesJSON
      });

      map.addSource('filtered-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
          ]
        }
      });

      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      map.on('move', () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      map.addLayer({
        id: "earthquakes",
        source: "earthquakes",
        /* in case we want to use symbols */ /* 
        // type: "symbol",
        // layout: {
        //   // full list of icons here: https://labs.mapbox.com/maki-icons
        //   "icon-image": "marker-15",
        //   "icon-padding": 0,
        //   "icon-allow-overlap": true
        // }
        */
        type: "circle",
        paint: {
          // make circles larger as the user zooms from z6 to z10
          'circle-radius': {
            base: 1.05,
            stops: [[6, 3], [10, 8]]
          },
          'circle-color': "red",
        },
      });

      map.addLayer(
        {
          id: "countries",
          source: "countries",
          type: "fill",
          paint: {
            "fill-opacity": 0.2,
            'fill-outline-color': "green"
          },
          filter: ["!=", "ISO_A3", ""]
        }
      );

      map.addLayer(
        {
          id: "countries-selected",
          source: "countries",
          type: "fill",
          paint: {
            "fill-opacity": 0,
            'fill-outline-color': "blue"
          },
          filter: ["==", "ISO_A3", ""]
        }
      );

      // change cursor to pointer when user hovers over a clickable feature
      map.on("mouseenter", "earthquakes", (e: MapboxEvent) => {
        if (e.features.length) {
          map.getCanvas().style.cursor = "pointer";
        }
      });

      map.on("mouseleave", "earthquakes", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "earthquakes", (e: MapboxEvent) => {
        const coordinates = e.features[0].geometry.coordinates.slice();

        setMarkerInfo(e.features[0].properties);
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML( getPopupHTML(e.features[0])
          )
          .addTo(map);
      });

      map.on("click", "countries", (e: MapboxEvent) => {
        if(!e.features.length) return;
        try{          
          const coordsRegion = e.features[0].geometry.coordinates;
          const countryRegion = Turf.multiPolygon(coordsRegion);
          const centerRegion = Turf.center(countryRegion);

          map.flyTo({
            center: centerRegion.geometry.coordinates
          });

          /* for zoom feature but got type error */
          // const bounds = coordsRegion.reduce((
          //   bounds: LngLatLike, coord: LngLatLike
          // ): Array<Array<LngLat>> => {
          //   return bounds.extend(coord);
          // }, new mapboxgl.LngLatBounds(coordsRegion[0], coordsRegion[0]));
          // map.fitBounds(bounds, { padding: 20});
        } catch(e) {
          console.log("Error: ", e)
        }
      });


      map.on("click", (e: MapboxEvent) => {
        const point = [e.point.x, e.point.y];
        const countriesFeatures = map.queryRenderedFeatures(point, {
          layers: ["countries"]
        });
        const earthquakesFeatures = map.querySourceFeatures("earthquakes");

        if (!countriesFeatures.length && !earthquakesFeatures.length) {
          map.setFilter('earthquakes',null);
          map.setFilter('countries',null);
          setShowAll(true);

          return;
        }

        if (countriesFeatures.length) {
          setLat(parseFloat(e.point.x));
          setLng(parseFloat(e.point.y));

          map.setFilter(
            'countries',
            ["!=", "ISO_A3", countriesFeatures[0].properties.ISO_A3]
          );
        }

        if (earthquakesFeatures.length && countriesFeatures.length) {
          const selectedCountryCoord = countriesFeatures[0].geometry.coordinates;
          map.setFilter(
            'earthquakes',
            ["within", Turf.multiPolygon(selectedCountryCoord)]
          );

        }
        
        setShowAll(false);
      });

      setMap(map);
    });

    // Clean up on unmount
    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const newMap: Map = map;
    if(showAll && newMap) {
      newMap.setFilter('earthquakes',null);
      newMap.setFilter('countries',null);
    }
  }, [map, showAll]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!map) return;
    map.flyTo({ center: [lng, lat] });
  };

  return (
    <div className="usgs-map-container">
        <div className="topbar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="map-container" />
        {markerInfo && getMapLegend(markerInfo)}
        <form 
          className="input-form"
          onSubmit={(e) => handleSubmit(e)}
        >
          <div>
            Show all
            <input
              id="country-id"
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
          </div>
          <label>
            Lng: 
            <input
              id="lng"
              type="number"
              value={lng ? lng : ""}
              onChange={(e) => setLng(parseFloat(e.target.value))}
            />
          </label>
          <label>
            Lat: 
            <input
              id="lat"
              type="number"
              value={lat ? lat : ""}
              onChange={(e) => setLat(parseFloat(e.target.value))}
            />
          </label>
          
          <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default USGSMap;
