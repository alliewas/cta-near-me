var Actions = require("../actions/Actions.js");
import * as request from "superagent";

var StationApi = {
  load: function(station, latitude, longitude) {
    console.log("StationApi.load");
    Actions.loadingStation();
    request.get("/api/station")
        .query({
            stationId: station.StationId,
            latitude: latitude,
            longitude: longitude
        }).
        end((err, response) => {
            if (response.ok) {
                Actions.gotStation(response.body);
            }
        });
  }
};

module.exports = StationApi;
