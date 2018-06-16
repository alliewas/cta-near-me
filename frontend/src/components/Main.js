import React from "react";
import {connect} from "react-redux";
var Actions = require("../actions/Actions.js");
import Nearby from "./Nearby.js";
import Lines from "./Lines.js";
import Icon from "./Icon.js";

function mapStateToProps(state) {
  return {
    tab: state.tab.currentTab,
  };
}

class PureMain extends React.PureComponent {
  constructor(props) {
    super(props);
    this.gotoNearby = this.gotoNearby.bind(this);
    this.gotoLines = this.gotoLines.bind(this);
    this.switchTab = this.switchTab.bind(this);
  }
  switchTab(tab) {
    if (this.props.tab != tab) {
      Actions.switchTab(tab);
    }
  }
  gotoNearby() {
    this.switchTab("nearby");
  }
  gotoLines() {
    this.switchTab("lines");
  }
  render() {
    var content;
    let nearbyClass = "clickable tab";
    let linesClass = "clickable tab";
    let nearbyIconClass = "";
    let linesIconClass = "";
    switch (this.props.tab) {
      case "nearby":
        nearbyClass += " selected";
        nearbyIconClass += " selected";
        content = <Nearby />;
        break;
      case "lines":
        linesClass += " selected";
        linesIconClass += " selected";
        content = <Lines />;
        break;
    }
    return (
      <div className="main">
        <div className="content">
          {content}
        </div>
        <div className="tabs row">
          <div className={nearbyClass} onClick={this.gotoNearby}>
            <Icon icon="map-marker" outerClassName="icon" innerClassName={nearbyIconClass} />
          </div>
          <div className={linesClass} onClick={this.gotoLines}>
            <Icon icon="list" outerClassName="icon" innerClassName={linesIconClass} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PureMain);