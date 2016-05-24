import React from "react";
var Arrival = require("./Arrival.js");

var Arrivals = React.createClass({
  render: function() {
    var stop = this.props.stop;
    return (
      <div className="arrivals row">
        {this.props.arrivals.slice(0,3).map(function(arrival, index) {
          return <Arrival key={index} stop={stop} arrival={arrival} />;
        })}
      </div>
    );
  }
});

module.exports = Arrivals;
