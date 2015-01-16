var Actions = require("../actions/Actions.js");
var Distance = require("./Distance.js");

var SimpleStation = React.createClass({
  _onClick: function() {
    Actions.chooseStation(this.props.station);
  },
  render: function() {
    var station = this.props.station;
    return (
      <div className="simpleStation row split" onClick={this._onClick}>
        <p>{station.Name}</p>
        <Distance km={station.Kilometers} />
      </div>
    );
  }
});

module.exports = SimpleStation;
