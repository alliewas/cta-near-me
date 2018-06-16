import React from "react";

export default class extends React.PureComponent {
  render() {
    return (
      <div className="loading center">
        {this.props.msg}
      </div>
    );
  }
}
