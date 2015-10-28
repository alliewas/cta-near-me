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

var LineStore = new Store({
  state: {
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
  },
  handlers: {
    "LOADING_LINES": function() {
      loadingLines = true;
      currentLine = null;
      currentStation = null;
    },
    "GOT_LINES": function(action) {
      lines = action.lines;
      loadingLines = false;
    },
    "CHOOSE_LINE": function(action) {
      currentLine = action.line;
      StationsApi.load(currentLine, LocationStore.state.latitude(), LocationStore.state.longitude());
    },
    "LOADING_STATIONS": function() {
      loadingStations = true;
    },
    "GOT_STATIONS": function(action) {
      stations = action.stations;
      loadingStations = false;
    },
    "CHOOSE_STATION": function(action) {
      StationApi.load(action.station, LocationStore.state.latitude(), LocationStore.state.longitude());
    },
    "LOADING_STATION": function() {
      loadingStation = true;
    },
    "GOT_STATION": function(action) {
      currentStation = action.station;
      loadingStation = false;
    },
    "BACK_TO_LINES": function() {
      currentLine = null;
      currentStation = null;
    },
    "BACK_TO_LINE": function() {
      currentStation = null;
    }
  }
});

module.exports = LineStore;
