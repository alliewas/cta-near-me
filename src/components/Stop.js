var Arrivals = require("./Arrivals.js");
var FavoriteStore = require("../stores/FavoriteStore.js");
var LineToggleStore = require("../stores/LineToggleStore.js");
var Actions = require("../actions/Actions.js");
var Icon = require("./Icon.js");

var Stop = React.createClass({
  getInitialState: function() {
    return {
      isFavorite: FavoriteStore.isFavorite(this.props.stop),
      isDisabled: LineToggleStore.isDisabled(this.props.stop.LineKey)
    };
  },
  componentDidMount: function() {
    FavoriteStore.addChangeListener(this._onChange);
    LineToggleStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    FavoriteStore.removeChangeListener(this._onChange);
    LineToggleStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(this.getInitialState());
    }
  },
  toggleFavorite: function() {
    if (this.state.isFavorite) {
      Actions.removeFavorite(this.props.stop);
    } else {
      Actions.addFavorite(this.props.stop);
    }
  },
  render: function() {
    var stop = this.props.stop;
    var favIcon;
    if (this.state.isFavorite) {
      favIcon = "isFavorite";
    } else {
      favIcon = "notFavorite";
    }
    var lineClass = "row split line line-" + stop.LineKey;
    if (!this.state.isDisabled && (!this.props.onlyFavorites || this.state.isFavorite)) {
      return (
        <div className="stop">
          <div className={lineClass}>
            <span>{stop.Name}</span>
            <button onClick={this.toggleFavorite}><Icon icon="star" innerClassName={favIcon} /></button>
          </div>
          {stop.Arrivals && <Arrivals stop={stop} arrivals={stop.Arrivals} />}
        </div>
      );
    } else {
      return null;
    }
  }
});

module.exports = Stop;
