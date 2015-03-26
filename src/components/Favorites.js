var FavoriteStore = require("../stores/FavoriteStore.js");
var LocationStore = require("../stores/LocationStore.js");
var StopsApi = require("../api/StopsApi.js");
var Stations = require("./Stations.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  return {
    loading: FavoriteStore.state.loading(),
    stopIds: FavoriteStore.state.stopIds(),
    stations: FavoriteStore.state.stations(),
    latitude: LocationStore.state.latitude(),
    longitude: LocationStore.state.longitude()
  };
}

var Favorites = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Favorites.mount");
    FavoriteStore.addChangeListener(this._onChange);
    LocationStore.addChangeListener(this._onChange);
    this._load();
  },
  componentWillUnmount: function() {
    FavoriteStore.removeChangeListener(this._onChange);
    LocationStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  _load: function() {
    if (this.state.stopIds.length > 0) {
      StopsApi.load(this.state.stopIds, this.state.latitude, this.state.longitude);
    }
  },
  render: function() {
    var content;
    if (this.state.stopIds.length == 0) {
      content = <div className="center">No favorites</div>;
    } else if (this.state.loading) {
      content = <Loading msg="Loading Favorites" />
    } else {
      content = (
        <div>
          <div className="row split">
            <button className="hidden"><Icon icon="reload" /></button>
            <LineToggleBar stations={this.state.stations} onlyFavorites={true} />
            <button className="refresh clickable" onClick={this._load}><Icon icon="reload" /></button>
          </div>
          <Stations stations={this.state.stations} onlyFavorites={true} />
        </div>
      );
    }
    return (
      <div className="favorites">
        {content}
      </div>
    );
  }
});

module.exports = Favorites;
