var Actions = require("../actions/Actions.js");

var LinesApi = {
  load: function() {
    console.log("LinesApi.load");
    Actions.loadingLines();
    $.getJSON("/api/lines", function(data) {
      Actions.gotLines(data);
    });
  }
};

module.exports = LinesApi;
