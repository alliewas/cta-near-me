var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var loading = false;
var latitude = null;
var longitude = null;

var LocationStore = $.extend({
  loading: function() {
    return loading;
  },
  latitude: function() {
    return latitude;
  },
  longitude: function() {
    return longitude;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "LOADING_LOCATION":
      loading = true;
      break;
    case "GOT_LOCATION":
      latitude = action.latitude;
      longitude = action.longitude;
      loading = false;
      break;
    default:
      return;
  }
  LocationStore.emitChange();
});

module.exports = LocationStore;
