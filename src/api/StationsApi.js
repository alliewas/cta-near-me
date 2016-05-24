var Actions = require("../actions/Actions.js");
import * as request from "superagent";

var StationsApi = {
  load: function(line, latitude, longitude) {
    console.log("StationsApi.load");
    Actions.loadingStations();
    request.get("/api/stations")
        .query({
            line: line.Key,
            latitude: latitude,
            longitude: longitude
        })
        .end((err, response) => {
            if (response.ok) {
                Actions.gotStations(response.body);
            }
        });
  }
};

module.exports = StationsApi;
