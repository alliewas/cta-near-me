var Actions = require("../actions/Actions.js");
import * as request from "superagent";
import {baseUrl} from "./Api";

export function load() {
    Actions.loadingLines();
    request.get(baseUrl + "/lines")
        .end((err, response) => {
            if (response.ok) {
                Actions.gotLines(response.body);
            }
        });
}
