var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var disabledLines = {};

var LineToggleStore = $.extend({
  isDisabled: function(line) {
    return disabledLines[line];
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "SWITCH_TAB":
    case "CHOOSE_LINE":
      disabledLines = {};
      break;
    case "DISABLE_LINE":
      disabledLines[action.line] = true;
      break;
    case "ENABLE_LINE":
      disabledLines[action.line] = false;
      break;
    default: return;
  }
  LineToggleStore.emitChange();
});

module.exports = LineToggleStore;
