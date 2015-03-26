var Actions = require("../actions/Actions.js");
var Distance = require("./Distance.js");

var SimpleStation = React.createClass({
  _onClick: function() {
    Actions.chooseStation(this.props.station);
  },
  render: function() {
    var station = this.props.station;
    var className = "clickable simpleStation row split line-bottom-" + this.props.line.Key;
    return (
      <div className={className} onClick={this._onClick}>
        <span className="name">{station.Name}</span>
        <Distance km={station.Kilometers} />
      </div>
    );
  }
});

module.exports = SimpleStation;
