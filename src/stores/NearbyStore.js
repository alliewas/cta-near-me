var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var NearbyApi = require("../api/NearbyApi.js");

var loading = false;
var stations = [];

var NearbyStore = $.extend({
  loading: function() {
    return loading;
  },
  stations: function() {
    return stations;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "GOT_LOCATION":
      NearbyApi.load(action.latitude, action.longitude);
      break;
    case "LOADING_NEARBY_STATIONS":
      loading = true;
      break;
    case "GOT_NEARBY_STATIONS":
      stations = action.stations;
      loading = false;
      break;
    default: return;
  }
  NearbyStore.emitChange();
});

module.exports = NearbyStore;
