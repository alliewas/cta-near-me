import React from "react";
import Stops from "./Stops.js";
import Distance from "./Distance.js";

export default class extends React.PureComponent {
  render() {
    var station = this.props.station;
    return (
      <div className="station">
        <div className="titleRow row split">
          <span className="name">{station.Name}</span>
          <Distance km={station.Kilometers} />
        </div>
        {station.StopArrivals && <Stops stops={station.StopArrivals} />}
      </div>
    );
  }
}
