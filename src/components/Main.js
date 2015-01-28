var TabStore = require("../stores/TabStore.js");
var Nearby = require("./Nearby.js");
var Lines = require("./Lines.js");
var Favorites = require("./Favorites.js");
var Actions = require("../actions/Actions.js");
var Icon = require("./Icon.js");

function gotoNearby() {
  Actions.switchTab("nearby");
}

function gotoLines() {
  Actions.switchTab("lines");
}

function gotoFavorites() {
  Actions.switchTab("favorites");
}

function getState() {
  console.log("Main.getState");
  return {
    tab: TabStore.state.current()
  };
}

var Main = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    TabStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TabStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  render: function() {
    var content;
    var nearbyClass = linesClass = favoritesClass = "tab";
    var nearbyIconClass = linesIconClass = favoritesIconClass = "";
    switch (this.state.tab) {
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
      case "favorites":
        favoritesClass += " selected";
        favoritesIconClass += " selected";
        content = <Favorites />;
        break;
    }
    return (
      <div className="main">
        <div className="tabs row">
          <div className={nearbyClass} onClick={gotoNearby}>
            <Icon icon="map-marker" outerClassName="icon" innerClassName={nearbyIconClass} />
          </div>
          <div className={linesClass} onClick={gotoLines}>
            <Icon icon="list" outerClassName="icon" innerClassName={linesIconClass} />
          </div>
          <div className={favoritesClass} onClick={gotoFavorites}>
            <Icon icon="star" outerClassName="icon" innerClassName={favoritesIconClass} />
          </div>
        </div>
        {content}
      </div>
    );
  }
});

module.exports = Main;
