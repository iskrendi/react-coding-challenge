import React, { useRef, useEffect, useState} from 'react';
// @ts-ignore
import mapboxgl, { Map, MapboxEvent, EventData, Feature } from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './USGSMap.css';
import countriesJSON from './data/countries.json';
import earthquakesJSON from './data/earthquakes.json';
// import { booleanPointInPolygon, buffer, inside, polygon } from "@turf/turf";
import * as Turf from "@turf/turf";
import { getPopupHTML, getMapLegend } from './helper';



mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbXBhdHRlcm5hZyIsImEiOiJja21udWtzOWYxc3FhMm9yd3k0azNhc3NlIn0.8AK6rDX4v_85w2hM-PxmMQ';

function USGSMap() {
  const mapContainer = useRef(null);
  // const map: Map = useRef(null);
  const [map, setMap] = useState(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2.5);
  const [markerInfo, setMarkerInfo] = useState(null);
  const [country, setCountry] = useState("");


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
        // type: "symbol",
        // layout: {
        //   // full list of icons here: https://labs.mapbox.com/maki-icons
        //   "icon-image": "marker-15",
        //   "icon-padding": 0,
        //   "icon-allow-overlap": true
        // }
        type: "circle",
        paint: {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            base: 1.05,
            stops: [[6, 3], [10, 8]]
          },
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
          'circle-color': "red",
        },
        // filter: ["within", {}]
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

      // map.setPaintProperty('countries', 'fill-color', {
      //   property: active.property,
      //   stops: active.stops
      // });

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
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.title;
        console.log("=== feature: ", e.features[0].properties)
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

      map.on("click", (e: MapboxEvent) => {
        const point = [e.point.x, e.point.y];
        const countriesFeatures = map.queryRenderedFeatures(point, {
          layers: ["countries"]
        });
        
        if (!countriesFeatures.length) {
          map.setFilter('earthquakes',null);
          map.setFilter('countries',null);
          
          return;
        }

        map.setFilter(
          'countries',
          ["!=", "ISO_A3", countriesFeatures[0].properties.ISO_A3]
        );

        const earthquakesFeatures = map.querySourceFeatures("earthquakes");
        // console.log("countriesFeatures: ", countriesFeatures[0]);
        // console.log("earthquakesFeatures: ", earthquakesFeatures[0]);

        if (earthquakesFeatures.length) {
          // const filteredPoints = earthquakesFeatures.filter((feature: Feature) => {
          //   const coordsP = earthquakesFeatures[0].geometry.coordinates;
          //   const coordsR = countriesFeatures[0].geometry.coordinates;
          //   const markerPoint = Turf.point(coordsP);
          //   const countryRegion = Turf.multiPolygon(coordsR);
          //   const isInside = Turf.booleanPointInPolygon(markerPoint, countryRegion);
          //   return isInside;
          // });
          // console.log("filteredPoints: ", filteredPoints);
          const selectedCountryCoord = countriesFeatures[0].geometry.coordinates;
          map.setFilter(
            'earthquakes',
            ["within", Turf.multiPolygon(selectedCountryCoord)]
          );
        }       
      });

      setMap(map);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div className="usgs-map-container">
        <div className="topbar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="map-container" />
        {markerInfo && getMapLegend(markerInfo)}
        <form 
          className="input-form"
          // onSubmit={() => handleSubmit()}
        >
          Enter your location
          <label>
            Lng: 
            <input
              id="country-id"
              type="text"
              name="Lat"
              onChange={(e) => setCountry(e.target.value)}
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
