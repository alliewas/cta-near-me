import React from "react";
import Stop from "./Stop.js";

export default class extends React.PureComponent {
  render() {
    var stops = this.props.stops;
    return (
      <div className="stops">
        {stops.map(function(stop, index) {
          return <Stop key={index} stop={stop} />;
        }.bind(this))}
      </div>
    );
  }
}
