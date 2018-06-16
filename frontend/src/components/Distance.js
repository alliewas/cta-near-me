import React from "react";

function kmToMiles(km) {
  return km * 0.621371;
}

export default class extends React.PureComponent {
  render() {
    var miles = (new Number(kmToMiles(this.props.km))).toFixed(1);
    return (
      <span className="distance">{miles} mi</span>
    );
  }
}
