import React from "react";
var Line = require("./Line.js");

var LineList = React.createClass({
  render: function() {
    return (
      <div className="lineList">
        {this.props.lines.map(function(line, index) {
          return <Line key={index} line={line} />;
        })}
      </div>
    );
  }
});

module.exports = LineList;
