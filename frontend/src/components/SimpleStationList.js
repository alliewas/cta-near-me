import React from "react";
import SimpleStation from "./SimpleStation.js";

export default class extends React.PureComponent {
  render() {
    return (
      <div className="simpleStationList">
        {this.props.stations.map(function(station, index) {
          return <SimpleStation key={index} station={station} line={this.props.line} />;
        }.bind(this))}
      </div>
    );
  }
}
