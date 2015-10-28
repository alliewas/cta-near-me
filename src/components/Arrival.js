var pluralize = function(base, value) {
  if (value != 1) {
    return base + "s";
  } else {
    return base;
  }
}

var shortTime = function(value) {
  if (value) {
    var d = new Date(value);
    var hours = d.getHours();
    var ampm = "PM";
    if (hours < 12) {
      ampm = "AM";
    }
    if (hours == 0) {
      hours += 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    var minutes = d.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return <span><span className="number">{hours}:{minutes}</span> {ampm}</span>;
  }
}

var Arrival = React.createClass({
  render: function() {
    var stop = this.props.stop;
    var arrival = this.props.arrival;
    var topContent;
    if (arrival.IsApproaching) {
      topContent = <span className="approaching">Approaching</span>;
    } else {
      topContent = <span className="arrivingIn"><span className="number">{arrival.ArrivingInMinutes}</span> {pluralize("min", arrival.ArrivingInMinutes)}</span>;
    }
    var bottomContent = <span className="arrivingTime">{shortTime(arrival.ArrivingAt)}</span>;
    var hrClass = "line-" + stop.LineKey;
    return (
      <div className="arrival">
        {topContent}
        <hr className={hrClass} />
        {bottomContent}
      </div>
    );
  }
});

module.exports = Arrival;
