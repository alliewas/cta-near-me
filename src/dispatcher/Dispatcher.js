var _callbacks = [];

var Dispatcher = {
  handleAction: function(action) {
    console.log("Action", action);
    _callbacks.forEach(function(callback) {
      callback.call(null, action);
    });
  },
  register: function(callback) {
    _callbacks.push(callback);
  }
};

module.exports = Dispatcher;
