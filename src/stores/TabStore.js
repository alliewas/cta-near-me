var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var currentTab = "nearby";

var TabStore = new Store({
  state: {
    current: function() {
      return currentTab;
    }
  },
  handlers: {
    "SWITCH_TAB": function(action) {
      currentTab = action.tab;
    }
  }
});

module.exports = TabStore;
