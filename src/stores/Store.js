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
    _adding: false,
    _removing: false,
    _emitting: false,
    _listeners: [],
    _names: [],
    isBusy: function() {
      return this._emitting || this._adding || this._removing;
    },
    emitChange: function() {
      if (this.isBusy()) {
        setTimeout(function() {
          this.emitChange();
        }.bind(this), 50);
        return;
      }
      this._emitting = true;
      this._listeners.forEach(function(listener, index) {
        listener.call(null);
      }.bind(this));
      this._emitting = false;
    },
    addChangeListener: function(listener, name) {
      if (this.isBusy()) {
        setTimeout(function() {
          this.addChangeListener(listener, name);
        }.bind(this), 50);
        return;
      }
      this._adding = true;
      this._listeners.push(listener);
      this._names.push(name);
      this._adding = false;
    },
    removeChangeListener: function(listener) {
      if (this.isBusy()) {
        setTimeout(function() {
          this.removeChangeListener(listener);
        }.bind(this), 50);
        return;
      }
      this._removing = true;
      var index = this._listeners.indexOf(listener);
      if (index != -1) {
        this._listeners.splice(index, 1);
        this._names.splice(index, 1);
      }
      this._removing = false;
    }
  };
};

module.exports = Store;
