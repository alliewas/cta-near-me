var Actions = require("../actions/Actions.js");
import * as request from "superagent";
import {baseUrl} from "./Api";

export function load(station, latitude, longitude) {
    Actions.loadingStation();
    request.get(baseUrl + "/station")
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
