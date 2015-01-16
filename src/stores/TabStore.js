var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var currentTab = "nearby";

var TabStore = $.extend({
  current: function() {
    return currentTab;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "SWITCH_TAB":
      currentTab = action.tab;
      break;
    default:
      return;
  }
  TabStore.emitChange();
});

module.exports = TabStore;
