var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var ArrayUtil = require("../util/ArrayUtil.js");
var LineStore = require("./LineStore.js");
var FavoriteStore = require("./FavoriteStore.js");

var enabledLines = {};

function setLines(stations, enabled, favoritesOnly) {
  enabledLines = {};
  stations.forEach(function(station) {
    station.StopArrivals.forEach(function(stop) {
      if (!favoritesOnly || FavoriteStore.state.isFavorite(stop)) {
        enabledLines[stop.LineKey] = enabled;
      }
    });
  });
}

var LineToggleStore = new Store({
  state: {
    lines: function() {
      return ArrayUtil.unique(Object.keys(enabledLines));
    },
    isEnabled: function(line) {
      return enabledLines[line];
    }
  },
  handlers: {
    "SWITCH_TAB": function(action) {
      enabledLines = {};
    },
    "CHOOSE_LINE": function(action) {
      enabledLines = {};
    },
    "DISABLE_LINE": function(action) {
      enabledLines[action.line] = false;
    },
    "ENABLE_LINE": function(action) {
      enabledLines[action.line] = true;
    },
    "GOT_NEARBY_STATIONS": function(action) {
      setLines(action.stations, true);
    },
    "GOT_STOPS": function(action) {
      setLines(action.stations, true, true);
    },
    "GOT_STATION": function(action) {
      setLines([action.station], false);
      enabledLines[LineStore.state.currentLine().Key] = true;
    }
  }
});

module.exports = LineToggleStore;
