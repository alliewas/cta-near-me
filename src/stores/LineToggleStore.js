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
      if (!favoritesOnly || FavoriteStore.isFavorite(stop)) {
        enabledLines[stop.LineKey] = enabled;
      }
    });
  });
}

var LineToggleStore = $.extend({
  lines: function() {
    return ArrayUtil.unique(Object.keys(enabledLines));
  },
  isEnabled: function(line) {
    return enabledLines[line];
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "SWITCH_TAB":
    case "CHOOSE_LINE":
      enabledLines = {};
      break;
    case "DISABLE_LINE":
      enabledLines[action.line] = false;
      break;
    case "ENABLE_LINE":
      enabledLines[action.line] = true;
      break;
    case "GOT_NEARBY_STATIONS":
      setLines(action.stations, true);
      break;
    case "GOT_STOPS":
      setLines(action.stations, true, true);
      break;
    case "GOT_STATION":
      setLines([action.station], false);
      enabledLines[LineStore.currentLine().Key] = true;
      break;
    default: return;
  }
  LineToggleStore.emitChange();
});

module.exports = LineToggleStore;
