var Arrival = require("./Arrival.js");

var Arrivals = React.createClass({
  render: function() {
    var stop = this.props.stop;
    return (
      <div className="arrivals row">
        {this.props.arrivals.map(function(arrival, index) {
          return <Arrival key={index} stop={stop} arrival={arrival} />;
        })}
      </div>
    );
  }
});

module.exports = Arrivals;
