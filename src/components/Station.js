var Stops = require("./Stops.js");
var Distance = require("./Distance.js");

var Station = React.createClass({
  render: function() {
    var station = this.props.station;
    return (
      <div className="station">
        <div className="titleRow row split">
          <span className="name">{station.Name}</span>
          <Distance km={station.Kilometers} />
        </div>
        {station.StopArrivals && <Stops stops={station.StopArrivals} onlyFavorites={this.props.onlyFavorites} />}
      </div>
    );
  }
});

module.exports = Station;
