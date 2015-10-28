var LocationUtil = require("../util/LocationUtil.js");
var LocationStore = require("../stores/LocationStore.js");
var NearbyStore = require("../stores/NearbyStore.js");
var Stations = require("./Stations.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  console.log("Nearby.getState");
  return {
    loadingLocation: LocationStore.state.loading(),
    latitude: LocationStore.state.latitude(),
    longitude: LocationStore.state.longitude(),
    loadingStations: NearbyStore.state.loading(),
    stations: NearbyStore.state.stations()
  };
}

function refresh() {
  console.log("refresh");
  LocationUtil.get();
}

var Nearby = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Nearby.mount");
    NearbyStore.addChangeListener(this._onChange);
    LocationStore.addChangeListener(this._onChange);
    LocationUtil.get();
  },
  componentWillUnmount: function() {
    console.log("Nearby.unmount");
    NearbyStore.removeChangeListener(this._onChange);
    LocationStore.removeChangeListener(this._onChange);
  },
  _onChange: function(x) {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  render: function() {
    var content;
    if (this.state.loadingLocation) {
      content = <Loading msg="Loading Location" />
    } else if (this.state.loadingStations) {
      content = <Loading msg="Loading Stations" />
    } else if (this.state.stations.length == 0) {
      content = <div className="center">No Nearby Stations</div>;
    } else {
      content = (
        <div>
          <div className="row split">
            <button className="hidden"><Icon icon="reload" /></button>
            <LineToggleBar stations={this.state.stations} />
            <button className="refresh clickable" onClick={refresh}><Icon icon="reload" /></button>
          </div>
          <Stations stations={this.state.stations} />
        </div>
      );
    }
    return (
      <div className="nearby">
        {content}
      </div>
    );
  }
});

module.exports = Nearby;
