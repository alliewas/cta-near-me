var Actions = require("../actions/Actions.js");
import * as request from "superagent";
import {baseUrl} from "./Api";

export function load(stopIds, latitude, longitude) {
    Actions.loadingStops();
    request.get(baseUrl + "/stops")
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
