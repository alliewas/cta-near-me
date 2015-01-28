var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var favoriteStops = read();
var loading = false;
var stations = [];

function supportsStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch(e) {
    return false;
  }
}

function read() {
  var stored = localStorage["favoriteStops"];
  if (stored) {
    return JSON.parse(stored);
  } else {
    return {};
  }
}

function write(blob) {
  localStorage["favoriteStops"] = JSON.stringify(blob);
}

var FavoriteStore = new Store({
  state: {
    stopIds: function() {
      var ids = [];
      for (var lineKey in favoriteStops) {
        for (var stopId in favoriteStops[lineKey]) {
          ids.push(stopId);
        }
      }
      return ids;
    },
    loading: function() {
      return loading;
    },
    stations: function() {
      return stations;
    },
    isFavorite: function(stop) {
      if (favoriteStops[stop.LineKey]) {
        if (favoriteStops[stop.LineKey][stop.StopId]) {
          return true;
        }
      }
      return false;
    }
  },
  handlers: {
    "ADD_FAVORITE": function(action) {
      var stop = action.stop;
      if (!FavoriteStore.state.isFavorite(stop)) {
        if (!favoriteStops[stop.LineKey]) {
          favoriteStops[stop.LineKey] = {};
        }
        favoriteStops[stop.LineKey][stop.StopId] = true;
      }
      write(favoriteStops);
    },
    "REMOVE_FAVORITE": function(action) {
      var stop = action.stop;
      if (FavoriteStore.state.isFavorite(stop)) {
        delete favoriteStops[stop.LineKey][stop.StopId];
      }
      write(favoriteStops);
    },
    "LOADING_STOPS": function(action) {
      loading = true;
    },
    "GOT_STOPS": function(action) {
      stations = action.stations;
      loading = false;
    }
  }
});

module.exports = FavoriteStore;
