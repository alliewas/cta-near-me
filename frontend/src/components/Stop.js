import React from "react";
import {connect} from "react-redux";
import Arrivals from "./Arrivals.js";
var Actions = require("../actions/Actions.js");
import Icon from "./Icon.js";

function mapStateToProps(state) {
  return {
  };
}

class PureStop extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    var stop = this.props.stop;
    var lineClass = "row split line line-" + stop.LineKey;
    return (
      <div className="stop">
        <div className={lineClass}>
          <span>to <span className="stopName">{stop.Name}</span></span>
        </div>
        {stop.Arrivals && <Arrivals stop={stop} arrivals={stop.Arrivals} />}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PureStop);
