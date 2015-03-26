var TabStore = require("../stores/TabStore.js");
var Nearby = require("./Nearby.js");
var Lines = require("./Lines.js");
var Favorites = require("./Favorites.js");
var Actions = require("../actions/Actions.js");
var Icon = require("./Icon.js");

var Main = React.createClass({
  getInitialState: function() {
    return {
      tab: TabStore.state.current()
    };
  },
  componentDidMount: function() {
    TabStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TabStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(this.getInitialState());
    }
  },
  gotoNearby: function() {
    this.switchTab("nearby");
  },
  gotoLines: function() {
    this.switchTab("lines");
  },
  gotoFavorites: function() {
    this.switchTab("favorites");
  },
  switchTab: function(tab) {
    if (this.state.tab != tab) {
      Actions.switchTab(tab);
    }
  },
  render: function() {
    var content;
    var nearbyClass = linesClass = favoritesClass = "clickable tab";
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
          <div className={favoritesClass} onClick={this.gotoFavorites}>
            <Icon icon="star" outerClassName="icon" innerClassName={favoritesIconClass} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Main;