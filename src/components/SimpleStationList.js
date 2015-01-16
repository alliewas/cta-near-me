var SimpleStation = require("./SimpleStation.js");

var SimpleStationList = React.createClass({
  render: function() {
    return (
      <div className="simpleStationList">
        {this.props.stations.map(function(station, index) {
          return <SimpleStation key={index} station={station} />;
        })}
      </div>
    );
  }
});

module.exports = SimpleStationList;
