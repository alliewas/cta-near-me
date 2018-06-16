import React from "react";
import Station from "./Station.js";

export default class extends React.PureComponent {
  render() {
    return (
      <div className="stations">
        {this.props.stations.map(function(station, index) {
          return <Station key={index} station={station} />;
        }.bind(this))}
      </div>
    );
  }
}
