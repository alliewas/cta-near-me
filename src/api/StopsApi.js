var Actions = require("../actions/Actions.js");
import * as request from "superagent";

var StopsApi = {
  load: function(stopIds, latitude, longitude) {
    console.log("StopsApi.load");
    Actions.loadingStops();
    request.get("/api/stops")
        .query({
            stopIds: stopIds.join(","),
            latitude: latitude,
            longitude: longitude
        })
        .end((err, response) => {
            if (response.ok) {
                Actions.gotStops(response.body);
            }
        });
  }
};

module.exports = StopsApi;
