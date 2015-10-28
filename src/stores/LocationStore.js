var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var loading = false;
var latitude = null;
var longitude = null;

var LocationStore = new Store({
  state: {
    loading: function() {
      return loading;
    },
    latitude: function() {
      return latitude;
    },
    longitude: function() {
      return longitude;
    }
  },
  handlers: {
    "LOADING_LOCATION": function() {
      loading = true;
    },
    "GOT_LOCATION": function(action) {
      latitude = action.latitude;
      longitude = action.longitude;
      loading = false;
    }
  }
});

module.exports = LocationStore;
