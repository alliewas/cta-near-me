import React from "react";
var Station = require("./Station.js");

var Stations = React.createClass({
  render: function() {
    return (
      <div className="stations">
        {this.props.stations.map(function(station, index) {
          return <Station key={index} station={station} onlyFavorites={this.props.onlyFavorites} />;
        }.bind(this))}
      </div>
    );
  }
});

module.exports = Stations;
