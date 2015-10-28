var Actions = require("../actions/Actions.js");

var StopsApi = {
  load: function(stopIds, latitude, longitude) {
    console.log("StopsApi.load");
    Actions.loadingStops();
    $.getJSON("/api/stops", {
      stopIds: stopIds.join(","),
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStops(data);
    });
  }
};

module.exports = StopsApi;
