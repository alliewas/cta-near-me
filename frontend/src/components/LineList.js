import React from "react";
import Line from "./Line.js";

export default class extends React.PureComponent {
  render() {
    return (
      <div className="lineList">
        {this.props.lines.map(function(line, index) {
          return <Line key={index} line={line} />;
        })}
      </div>
    );
  }
}
