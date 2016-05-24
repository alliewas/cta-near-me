var Actions = require("../actions/Actions.js");
import * as request from "superagent";

var LinesApi = {
  load: function() {
    console.log("LinesApi.load");
    Actions.loadingLines();
    request.get("/api/lines")
        .end((err, response) => {
            if (response.ok) {
                Actions.gotLines(response.body);
            }
        });
  }
};

module.exports = LinesApi;
