import React from "react";
import {connect} from "react-redux";
var Actions = require("../actions/Actions.js");
import Stations from "./Stations.js";
import Loading from "./Loading.js";
import Icon from "./Icon.js";

function mapStateToProps(state) {
  return {
    locationFailed: state.location.locationFailed,
    locationUnavailable: state.location.locationUnavailable,
    loadingLocation: state.location.loading,
    loadingStations: state.nearby.loading,
    stations: state.nearby.stations,
  };
}

function refresh() {
  Actions.loadLocation();
}

class PureNearby extends React.PureComponent {
  render() {
    var content;
    if (this.props.loadingLocation) {
      content = <Loading msg="Loading Location" />
    } else if (this.props.locationFailed) {
      content = <Loading msg="Location Failed" />
    } else if (this.props.locationUnavailable) {
      content = <Loading msg="Location Unavailable" />
    } else if (this.props.loadingStations) {
      content = <Loading msg="Loading Nearby Stations" />
    } else if (this.props.stations.length == 0) {
      content = <div className="center">No Nearby Stations</div>;
    } else {
      content = (
        <div>
          <div className="row split">
            <button className="hidden"><Icon icon="reload" /></button>
            <button className="refresh clickable" onClick={refresh}><Icon icon="reload" /></button>
          </div>
          <Stations stations={this.props.stations} />
        </div>
      );
    }
    return (
      <div className="nearby">
        {content}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PureNearby);