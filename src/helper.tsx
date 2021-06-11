// @ts-ignore
import { EventData} from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

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
    // `<div>
    //   <div>Title: ${feature.properties.title}</div>
    //   <div>Magnitude: ${feature.properties.mag}</div>

    //   <div>Coords: ${feature.geometry.coordinates}</div>
    // </div>`
  );
};

export const getMapLegend = (properties: EventData) => {
  // console.log("properties: ", properties);
  const time = new Date(properties.time);
  // console.log("time: ", time.toString());

  return (
    <div id="state-legend" className="legend">
      <h4>Earthquake info</h4>
      <div>Title: {properties.title}</div>
      <div>Magnitude: {properties.mag}</div>
      <div>Date/Time: {time.toString()}</div>
    </div>
  );
};


