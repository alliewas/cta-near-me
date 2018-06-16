var Actions = require("../actions/Actions.js");
import * as request from "superagent";
import {baseUrl} from "./Api";

export function load(line, latitude, longitude) {
    Actions.loadingStations();
    request.get(baseUrl + "/stations")
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
