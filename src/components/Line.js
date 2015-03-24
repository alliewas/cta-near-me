var Actions = require("../actions/Actions.js");

var Line = React.createClass({
  _onClick: function() {
    Actions.chooseLine(this.props.line);
  },
  render: function() {
    var line = this.props.line;
    var leftClass = "left double-" + line.Key;
    var rightClass = "right double-" + line.Key;
    return (
      <div className="line row" onClick={this._onClick} onTouchEnd={this._onClick}>
        <div className={leftClass}></div>
        <div className="name">{line.Name}</div>
        <div className={rightClass}></div>
      </div>
    );
  }
});

module.exports = Line;
