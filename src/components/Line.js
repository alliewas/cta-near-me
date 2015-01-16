var Actions = require("../actions/Actions.js");

var Line = React.createClass({
  _onClick: function() {
    Actions.chooseLine(this.props.line);
  },
  render: function() {
    var line = this.props.line;
    var lineClass = "line line-bottom-" + line.Key;
    return (
      <div className={lineClass} onClick={this._onClick}>
        {line.Name}
      </div>
    );
  }
});

module.exports = Line;
