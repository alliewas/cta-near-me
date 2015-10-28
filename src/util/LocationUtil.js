var Actions = require("../actions/Actions.js");

var LocationUtil = {
  available: function() {
    return navigator.geolocation;
  },
  get: function() {
    console.log("LocationUtil.get");
    if (this.available()) {
      Actions.loadingLocation();
      navigator.geolocation.getCurrentPosition(function(pos) {
        console.log("got location", pos.coords);
        Actions.gotLocation(pos.coords.latitude, pos.coords.longitude);
      }, function(msg) {
        Actions.locationFailed(msg);
      });
    } else {
      Actions.locationUnavailable();
    }
  }
};

module.exports = LocationUtil;
