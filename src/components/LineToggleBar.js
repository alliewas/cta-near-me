var LineToggle = require("./LineToggle.js");
var ArrayUtil = require("../util/ArrayUtil.js");

var LineToggleBar = React.createClass({
  render: function() {
    var stations = this.props.stations;
    var lines = [];
    stations.forEach(function(station) {
      station.StopArrivals.forEach(function(stop) {
        lines.push(stop.LineKey);
      });
    });
    lines = ArrayUtil.unique(lines);
    return (
      <div className="lineToggleBar row">
        {lines && (lines.length > 1) && lines.map(function(line, index) {
          return (
            <LineToggle key={index} line={line} />
          );
        })}
      </div>
    );
  }
});

module.exports = LineToggleBar;
