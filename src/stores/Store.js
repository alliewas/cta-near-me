/*
 * Use like this:
 *
 *   var SomeStore = $.extend({
 *     stuff: 1
 *   }, Store());
 *
 * Note that you're calling the Store() function to get back a clean base Object.
 */
var Store = function() {
  return {
    _listeners: [],
    emitChange: function() {
      this._listeners.forEach(function(listener) {
        listener.call(null);
      });
    },
    addChangeListener: function(listener) {
      this._listeners.push(listener);
    },
    removeChangeListener: function(listener) {
      var index = this._listeners.indexOf(listener);
      if (index != -1) {
        this._listeners.splice(index, 1);
      }
    }
  };
};

module.exports = Store;
