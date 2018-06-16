import React from "react";
var Actions = require("../actions/Actions.js");
import Distance from "./Distance.js";

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }
  _onClick() {
    Actions.chooseStation(this.props.station);
  }
  render() {
    var station = this.props.station;
    var className = "clickable simpleStation row split line-bottom-" + this.props.line.Key;
    return (
      <div className={className} onClick={this._onClick}>
        <span className="name">{station.Name}</span>
        <Distance km={station.Kilometers} />
      </div>
    );
  }
}
