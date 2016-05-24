import React from "react";

var Loading = React.createClass({
  render: function() {
    return (
      <div className="loading center">
        {this.props.msg}
      </div>
    );
  }
});

module.exports = Loading;
