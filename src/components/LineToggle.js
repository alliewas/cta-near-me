var LineToggleStore = require("../stores/LineToggleStore.js");
var Actions = require("../actions/Actions.js");

var LineToggle = React.createClass({
  getInitialState: function() {
    return {
      isEnabled: LineToggleStore.isEnabled(this.props.line)
    };
  },
  componentDidMount: function() {
    LineToggleStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    LineToggleStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(this.getInitialState());
    }
  },
  toggle: function() {
    var line = this.props.line;
    if (this.state.isEnabled) {
      Actions.disableLine(line);
    } else {
      Actions.enableLine(line);
    }
  },
  render: function() {
    var line = this.props.line;
    var className = "lineToggle line-" + line;
    if (!this.state.isEnabled) {
      className += " disabled";
    }
    return (
      <div className={className} onClick={this.toggle}></div>
    );
  }
});

module.exports = LineToggle;
