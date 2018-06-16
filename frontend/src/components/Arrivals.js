import React from "react";
import Arrival from "./Arrival.js";

export default class extends React.PureComponent {
  render() {
    var stop = this.props.stop;
    return (
      <div className="arrivals row">
        {this.props.arrivals.slice(0,3).map(function(arrival, index) {
          return <Arrival key={index} stop={stop} arrival={arrival} />;
        })}
      </div>
    );
  }
}
