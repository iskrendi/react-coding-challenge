// @ts-ignore
import { EventData} from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

export const getPopupHTML = (feature: EventData): string => {
  return (
    `<table> 
      <tr>
          <td>Title</td>
          <td>${feature.properties.title}</td>
      </tr>
      <tr>
          <td>Magnitude</td>
          <td>${feature.properties.mag}</td>
      </tr>
      <tr>
          <td>Time</td>
          <td>${new Date(feature.properties.time)}</td>
      </tr>
      <tr>
          <td>Coord</td>
          <td>${feature.geometry.coordinates}</td>
      </tr>
    </table>`
  );
};

export const getMapLegend = (properties: EventData) => {
  const time = new Date(properties.time);

  return (
    <div id="state-legend" className="legend">
      <h4>Earthquake info</h4>
      <div>Title: {properties.title}</div>
      <div>Magnitude: {properties.mag}</div>
      <div>Date/Time: {time.toString()}</div>
    </div>
  );
};

/* in case we need to filter using turf*/ /*
// import { booleanPointInPolygon, buffer, inside, polygon } from "@turf/turf";
// export const filteredPoints = earthquakesFeatures.filter((feature: Feature) => {
//   const coordsP = earthquakesFeatures[0].geometry.coordinates;
//   const coordsR = countriesFeatures[0].geometry.coordinates;
//   const markerPoint = Turf.point(coordsP);
//   const countryRegion = Turf.multiPolygon(coordsR);
//   const isInside = Turf.booleanPointInPolygon(markerPoint, countryRegion);
//   return isInside;
// });
*/