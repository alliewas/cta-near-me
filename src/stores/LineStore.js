var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var StationsApi = require("../api/StationsApi.js");
var StationApi = require("../api/StationApi.js");
var LocationStore = require("./LocationStore.js");

var loadingLines = false;
var lines = [];
var currentLine = null;
var loadingStations = false;
var stations = [];
var loadingStation = false;
var currentStation = null;

var LineStore = $.extend({
  loadingLines: function() {
    return loadingLines;
  },
  lines: function() {
    return lines;
  },
  currentLine: function() {
    return currentLine;
  },
  loadingStations: function() {
    return loadingStations;
  },
  stations: function() {
    return stations;
  },
  loadingStation: function() {
    return loadingStation;
  },
  currentStation: function() {
    return currentStation;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "LOADING_LINES":
      loadingLines = true;
      currentLine = null;
      currentStation = null;
      break;
    case "GOT_LINES":
      lines = action.lines;
      loadingLines = false;
      break;
    case "CHOOSE_LINE":
      currentLine = action.line;
      StationsApi.load(currentLine, LocationStore.latitude(), LocationStore.longitude());
      break;
    case "LOADING_STATIONS":
      loadingStations = true;
      break;
    case "GOT_STATIONS":
      stations = action.stations;
      loadingStations = false;
      break;
    case "CHOOSE_STATION":
      StationApi.load(action.station, LocationStore.latitude(), LocationStore.longitude());
      break;
    case "LOADING_STATION":
      loadingStation = true;
      break;
    case "GOT_STATION":
      currentStation = action.station;
      loadingStation = false;
      break;
    case "BACK_TO_LINES":
      currentLine = null;
      currentStation = null;
      break;
    case "BACK_TO_LINE":
      currentStation = null;
      break;
    default: return;
  }
  LineStore.emitChange();
});

module.exports = LineStore;
