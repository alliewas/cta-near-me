import React from "react";
var LineToggle = require("./LineToggle.js");
var LineToggleStore = require("../stores/LineToggleStore.js");

var LineToggleBar = React.createClass({
  getInitialState: function() {
    return {
      lines: LineToggleStore.state.lines()
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
  render: function() {
    var lines = this.state.lines;
    return (
      <div className="lineToggleBar row">
        {lines && (lines.length > 1) && lines.map(function(line, index) {
          return (
            <LineToggle key={index} line={line} />
          );
        })}
      </div>
    );
  }
});

module.exports = LineToggleBar;
