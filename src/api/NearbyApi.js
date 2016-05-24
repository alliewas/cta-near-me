var Actions = require("../actions/Actions.js");
import * as request from "superagent";

var NearbyApi = {
  load: function(latitude, longitude) {
    console.log("NearbyApi.load");
    Actions.loadingNearbyStations();
    request.get("/api/nearby")
        .query({
            latitude: latitude,
            longitude: longitude
        })
        .end((err, response) => {
            if (response.ok) {
                Actions.gotNearbyStations(response.body);
            }
        });
  }
};

module.exports = NearbyApi;
