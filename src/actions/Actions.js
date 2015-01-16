var Dispatcher = require("../dispatcher/Dispatcher.js");

var Actions = {
  switchTab: function(tab) {
    Dispatcher.handleAction({
      type: "SWITCH_TAB",
      tab: tab
    });
  },
  loadingLocation: function() {
    Dispatcher.handleAction({
      type: "LOADING_LOCATION"
    });
  },
  gotLocation: function(latitude, longitude) {
    Dispatcher.handleAction({
      type: "GOT_LOCATION",
      latitude: latitude,
      longitude: longitude
    });
  },
  locationFailed: function(msg) {
    Dispatcher.handleAction({
      type: "LOCATION_FAILED",
      msg: msg
    });
  },
  locationUnavailable: function() {
    Dispatcher.handleAction({
      type: "LOCATION_UNAVAILABLE"
    });
  },
  loadingNearbyStations: function() {
    Dispatcher.handleAction({
      type: "LOADING_NEARBY_STATIONS"
    });
  },
  gotNearbyStations: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_NEARBY_STATIONS",
      stations: stations
    });
  },
  loadingLines: function() {
    Dispatcher.handleAction({
      type: "LOADING_LINES"
    });
  },
  gotLines: function(lines) {
    Dispatcher.handleAction({
      type: "GOT_LINES",
      lines: lines
    });
  },
  chooseLine: function(line) {
    Dispatcher.handleAction({
      type: "CHOOSE_LINE",
      line: line
    });
  },
  loadingStations: function() {
    Dispatcher.handleAction({
      type: "LOADING_STATIONS"
    });
  },
  gotStations: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_STATIONS",
      stations: stations
    });
  },
  chooseStation: function(station) {
    Dispatcher.handleAction({
      type: "CHOOSE_STATION",
      station: station
    });
  },
  loadingStation: function() {
    Dispatcher.handleAction({
      type: "LOADING_STATION"
    });
  },
  gotStation: function(station) {
    Dispatcher.handleAction({
      type: "GOT_STATION",
      station: station
    });
  },
  backToLines: function() {
    Dispatcher.handleAction({
      type: "BACK_TO_LINES"
    });
  },
  backToLine: function() {
    Dispatcher.handleAction({
      type: "BACK_TO_LINE"
    });
  },
  loadingStops: function() {
    Dispatcher.handleAction({
      type: "LOADING_STOPS"
    });
  },
  gotStops: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_STOPS",
      stations: stations
    });
  },
  addFavorite: function(stop) {
    Dispatcher.handleAction({
      type: "ADD_FAVORITE",
      stop: stop
    });
  },
  removeFavorite: function(stop) {
    Dispatcher.handleAction({
      type: "REMOVE_FAVORITE",
      stop: stop
    });
  },
  enableLine: function(line) {
    Dispatcher.handleAction({
      type: "ENABLE_LINE",
      line: line
    });
  },
  disableLine: function(line) {
    Dispatcher.handleAction({
      type: "DISABLE_LINE",
      line: line
    });
  }
};

module.exports = Actions;
