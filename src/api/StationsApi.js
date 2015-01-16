var Actions = require("../actions/Actions.js");

var StationsApi = {
  load: function(line, latitude, longitude) {
    console.log("StationsApi.load");
    Actions.loadingStations();
    $.getJSON("/api/stations", {
      line: line.Key,
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStations(data);
    });
  }
};

module.exports = StationsApi;
