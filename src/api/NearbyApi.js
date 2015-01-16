var Actions = require("../actions/Actions.js");

var NearbyApi = {
  load: function(latitude, longitude) {
    console.log("NearbyApi.load");
    Actions.loadingNearbyStations();
    $.getJSON("/api/nearby", {
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotNearbyStations(data);
    });
  }
};

module.exports = NearbyApi;
