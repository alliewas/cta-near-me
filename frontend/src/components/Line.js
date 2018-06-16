import React from "react";
var Actions = require("../actions/Actions.js");

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }
  _onClick() {
    Actions.chooseLine(this.props.line);
  }
  render() {
    var line = this.props.line;
    var leftClass = "left double-" + line.Key;
    var rightClass = "right double-" + line.Key;
    return (
      <div className="line row clickable" onClick={this._onClick}>
        <div className={leftClass}></div>
        <div className="name">{line.Name}</div>
        <div className={rightClass}></div>
      </div>
    );
  }
}
