var Actions = require("../actions/Actions.js");
import * as request from "superagent";
import {baseUrl} from "./Api";

export function load(latitude, longitude) {
    Actions.loadingNearbyStations();
    request.get(baseUrl + "/nearby")
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
