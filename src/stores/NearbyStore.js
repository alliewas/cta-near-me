var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var NearbyApi = require("../api/NearbyApi.js");

var loading = false;
var stations = [];

var NearbyStore = new Store({
  state: {
    loading: function() {
      return loading;
    },
    stations: function() {
      return stations;
    }
  },
  handlers: {
    "GOT_LOCATION": function(action) {
      console.log("Nearby.gotLocation");
      NearbyApi.load(action.latitude, action.longitude);
    },
    "LOADING_NEARBY_STATIONS": function() {
      loading = true;
    },
    "GOT_NEARBY_STATIONS": function(action) {
      stations = action.stations;
      loading = false;
    }
  }
});

module.exports = NearbyStore;
