function kmToMiles(km) {
  return km * 0.621371;
}

var Distance = React.createClass({
  render: function() {
    var miles = (new Number(kmToMiles(this.props.km))).toFixed(1);
    return (
      <span className="distance">{miles} mi</span>
    );
  }
});

module.exports = Distance;
