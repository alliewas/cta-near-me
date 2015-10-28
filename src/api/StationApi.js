var Actions = require("../actions/Actions.js");

var StationApi = {
  load: function(station, latitude, longitude) {
    console.log("StationApi.load");
    Actions.loadingStation();
    $.getJSON("/api/station", {
      stationId: station.StationId,
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStation(data);
    });
  }
};

module.exports = StationApi;
