import React from "react";
var Stop = require("./Stop.js");

var Stops = React.createClass({
  render: function() {
    var stops = this.props.stops;
    return (
      <div className="stops">
        {stops.map(function(stop, index) {
          return <Stop key={index} stop={stop} onlyFavorites={this.props.onlyFavorites} />;
        }.bind(this))}
      </div>
    );
  }
});

module.exports = Stops;
