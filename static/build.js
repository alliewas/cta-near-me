(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dispatcher = require("../dispatcher/Dispatcher.js");

var Actions = {
  switchTab: function(tab) {
    Dispatcher.handleAction({
      type: "SWITCH_TAB",
      tab: tab
    });
  },
  loadingLocation: function() {
    Dispatcher.handleAction({
      type: "LOADING_LOCATION"
    });
  },
  gotLocation: function(latitude, longitude) {
    Dispatcher.handleAction({
      type: "GOT_LOCATION",
      latitude: latitude,
      longitude: longitude
    });
  },
  locationFailed: function(msg) {
    Dispatcher.handleAction({
      type: "LOCATION_FAILED",
      msg: msg
    });
  },
  locationUnavailable: function() {
    Dispatcher.handleAction({
      type: "LOCATION_UNAVAILABLE"
    });
  },
  loadingNearbyStations: function() {
    Dispatcher.handleAction({
      type: "LOADING_NEARBY_STATIONS"
    });
  },
  gotNearbyStations: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_NEARBY_STATIONS",
      stations: stations
    });
  },
  loadingLines: function() {
    Dispatcher.handleAction({
      type: "LOADING_LINES"
    });
  },
  gotLines: function(lines) {
    Dispatcher.handleAction({
      type: "GOT_LINES",
      lines: lines
    });
  },
  chooseLine: function(line) {
    Dispatcher.handleAction({
      type: "CHOOSE_LINE",
      line: line
    });
  },
  loadingStations: function() {
    Dispatcher.handleAction({
      type: "LOADING_STATIONS"
    });
  },
  gotStations: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_STATIONS",
      stations: stations
    });
  },
  chooseStation: function(station) {
    Dispatcher.handleAction({
      type: "CHOOSE_STATION",
      station: station
    });
  },
  loadingStation: function() {
    Dispatcher.handleAction({
      type: "LOADING_STATION"
    });
  },
  gotStation: function(station) {
    Dispatcher.handleAction({
      type: "GOT_STATION",
      station: station
    });
  },
  backToLines: function() {
    Dispatcher.handleAction({
      type: "BACK_TO_LINES"
    });
  },
  backToLine: function() {
    Dispatcher.handleAction({
      type: "BACK_TO_LINE"
    });
  },
  loadingStops: function() {
    Dispatcher.handleAction({
      type: "LOADING_STOPS"
    });
  },
  gotStops: function(stations) {
    Dispatcher.handleAction({
      type: "GOT_STOPS",
      stations: stations
    });
  },
  addFavorite: function(stop) {
    Dispatcher.handleAction({
      type: "ADD_FAVORITE",
      stop: stop
    });
  },
  removeFavorite: function(stop) {
    Dispatcher.handleAction({
      type: "REMOVE_FAVORITE",
      stop: stop
    });
  },
  enableLine: function(line) {
    Dispatcher.handleAction({
      type: "ENABLE_LINE",
      line: line
    });
  },
  disableLine: function(line) {
    Dispatcher.handleAction({
      type: "DISABLE_LINE",
      line: line
    });
  }
};

module.exports = Actions;

},{"../dispatcher/Dispatcher.js":27}],2:[function(require,module,exports){
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

},{"../actions/Actions.js":1}],3:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var NearbyApi = {
  load: function(latitude, longitude) {
    console.log("NearbyApi.load");
    Actions.loadingNearbyStations();
    $.getJSON("/api/nearby", {
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotNearbyStations(data);
    });
  }
};

module.exports = NearbyApi;

},{"../actions/Actions.js":1}],4:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var StationApi = {
  load: function(station, latitude, longitude) {
    console.log("StationApi.load");
    Actions.loadingStation();
    $.getJSON("/api/station", {
      stationId: station.StationId,
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStation(data);
    });
  }
};

module.exports = StationApi;

},{"../actions/Actions.js":1}],5:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var StationsApi = {
  load: function(line, latitude, longitude) {
    console.log("StationsApi.load");
    Actions.loadingStations();
    $.getJSON("/api/stations", {
      line: line.Key,
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStations(data);
    });
  }
};

module.exports = StationsApi;

},{"../actions/Actions.js":1}],6:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var StopsApi = {
  load: function(stopIds, latitude, longitude) {
    console.log("StopsApi.load");
    Actions.loadingStops();
    $.getJSON("/api/stops", {
      stopIds: stopIds.join(","),
      latitude: latitude,
      longitude: longitude
    }, function(data) {
      Actions.gotStops(data);
    });
  }
};

module.exports = StopsApi;

},{"../actions/Actions.js":1}],7:[function(require,module,exports){
var Main = require("./components/Main.js");

React.render(
  React.createElement(Main, null),
  document.getElementById("content")
);

},{"./components/Main.js":19}],8:[function(require,module,exports){
var pluralize = function(base, value) {
  if (value != 1) {
    return base + "s";
  } else {
    return base;
  }
}

var shortTime = function(value) {
  if (value) {
    var d = new Date(value);
    var hours = d.getHours();
    var ampm = "PM";
    if (hours < 12) {
      ampm = "AM";
    }
    if (hours == 0) {
      hours += 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    var minutes = d.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return hours + ":" + minutes + " " + ampm;
  }
}

var Arrival = React.createClass({displayName: 'Arrival',
  render: function() {
    var stop = this.props.stop;
    var arrival = this.props.arrival;
    var topContent;
    if (arrival.IsApproaching) {
      topContent = React.createElement("span", {className: "approaching"}, "Approaching");
    } else {
      topContent = React.createElement("span", {className: "arrivingIn"}, arrival.ArrivingInMinutes, " ", pluralize("min", arrival.ArrivingInMinutes));
    }
    var bottomContent = React.createElement("span", {className: "arrivingTime"}, shortTime(arrival.ArrivingAt));
    if (arrival.IsDelayed) {
      bottomContent += React.createElement("span", null, "*");
    }
    var hrClass = "line-" + stop.LineKey;
    return (
      React.createElement("div", {className: "arrival"}, 
        topContent, 
        React.createElement("hr", {className: hrClass}), 
        bottomContent
      )
    );
  }
});

module.exports = Arrival;

},{}],9:[function(require,module,exports){
var Arrival = require("./Arrival.js");

var Arrivals = React.createClass({displayName: 'Arrivals',
  render: function() {
    var stop = this.props.stop;
    return (
      React.createElement("div", {className: "arrivals row"}, 
        this.props.arrivals.map(function(arrival, index) {
          return React.createElement(Arrival, {key: index, stop: stop, arrival: arrival});
        })
      )
    );
  }
});

module.exports = Arrivals;

},{"./Arrival.js":8}],10:[function(require,module,exports){
function kmToMiles(km) {
  return km * 0.621371;
}

var Distance = React.createClass({displayName: 'Distance',
  render: function() {
    var miles = (new Number(kmToMiles(this.props.km))).toFixed(1);
    return (
      React.createElement("span", {className: "distance"}, miles, " mi")
    );
  }
});

module.exports = Distance;

},{}],11:[function(require,module,exports){
var FavoriteStore = require("../stores/FavoriteStore.js");
var LocationStore = require("../stores/LocationStore.js");
var StopsApi = require("../api/StopsApi.js");
var Stations = require("./Stations.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  return {
    loading: FavoriteStore.loading(),
    stopIds: FavoriteStore.stopIds(),
    stations: FavoriteStore.stations(),
    latitude: LocationStore.latitude(),
    longitude: LocationStore.longitude()
  };
}

var Favorites = React.createClass({displayName: 'Favorites',
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Favorites.mount");
    FavoriteStore.addChangeListener(this._onChange);
    LocationStore.addChangeListener(this._onChange);
    this._load();
  },
  componentWillUnmount: function() {
    FavoriteStore.removeChangeListener(this._onChange);
    LocationStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  _load: function() {
    if (this.state.stopIds.length > 0) {
      StopsApi.load(this.state.stopIds, this.state.latitude, this.state.longitude);
    }
  },
  render: function() {
    var content;
    if (this.state.stopIds.length == 0) {
      content = React.createElement("div", {className: "center"}, "No favorites");
    } else if (this.state.loading) {
      content = React.createElement(Loading, {msg: "Loading Favorites"})
    } else {
      content = (
        React.createElement("div", null, 
          React.createElement("div", {className: "row split"}, 
            React.createElement("button", {className: "hidden"}, React.createElement(Icon, {icon: "reload"})), 
            React.createElement(LineToggleBar, {stations: this.state.stations}), 
            React.createElement("button", {className: "refresh", onClick: this._load}, React.createElement(Icon, {icon: "reload"}))
          ), 
          React.createElement(Stations, {stations: this.state.stations, onlyFavorites: true})
        )
      );
    }
    return (
      React.createElement("div", {className: "favorites"}, 
        content
      )
    );
  }
});

module.exports = Favorites;

},{"../api/StopsApi.js":6,"../stores/FavoriteStore.js":28,"../stores/LocationStore.js":31,"./Icon.js":12,"./LineToggleBar.js":16,"./Loading.js":18,"./Stations.js":24}],12:[function(require,module,exports){
/*
 * This renders an SVG icon from the open-iconic iconset.
 *
 * Specify which icon with the "icon" parameter.
 *
 * You can set an outer class on the <svg> element with "outerClassName", and
 * an inner class on the <use> element with "innerClassName".
 *
 * You'll set the size with the outer class, and the color with the inner class (using the
 * "fill" CSS style).
 *
 *  <Icon icon="map-marker" />
 *  <Icon icon="map-marker" outerClassName="big" />
 *  <Icon icon="map-marker" outerClassName="big" innerClassName="selected" />
 *
 * Note that this has to use "dangerouslySetInnerHTML" because the <use> element isn't
 * on React's whitelist of HTML elements.
 */
var Icon = React.createClass({displayName: 'Icon',
  /*
   * This is necessary because we're using dangerouslySetInnerHTML, which won't see className
   * changes. So we need to manually update the class, when it changes.
   */
  componentDidUpdate: function(oldProps) {
    var oldInner = inner(oldProps.innerClassName);
    var newInner = inner(this.props.innerClassName);
    if (oldInner != newInner) {
      var svg = this.getDOMNode();
      var use = svg.firstChild;
      use.setAttribute("class", newInner);
    }
  },
  render: function() {
    var icon = this.props.icon;
    var outerClassName = "icon " + (this.props.outerClassName || "");
    var innerClassName = inner(this.props.innerClassName);
    return (
      React.createElement("svg", {viewBox: "0 0 8 8", className: outerClassName, dangerouslySetInnerHTML: {__html: '<use xlink:href="/open-iconic.svg#' + icon + '" class="' + innerClassName + '"></use>'}})
    );
  }
});

function inner(prop) {
  return "inner " + (prop || "");
}

module.exports = Icon;

},{}],13:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var Line = React.createClass({displayName: 'Line',
  _onClick: function() {
    Actions.chooseLine(this.props.line);
  },
  render: function() {
    var line = this.props.line;
    var lineClass = "line line-bottom-" + line.Key;
    return (
      React.createElement("div", {className: lineClass, onClick: this._onClick}, 
        line.Name
      )
    );
  }
});

module.exports = Line;

},{"../actions/Actions.js":1}],14:[function(require,module,exports){
var Line = require("./Line.js");

var LineList = React.createClass({displayName: 'LineList',
  render: function() {
    return (
      React.createElement("div", {className: "lineList"}, 
        this.props.lines.map(function(line, index) {
          return React.createElement(Line, {key: index, line: line});
        })
      )
    );
  }
});

module.exports = LineList;

},{"./Line.js":13}],15:[function(require,module,exports){
var LineToggleStore = require("../stores/LineToggleStore.js");
var Actions = require("../actions/Actions.js");

var LineToggle = React.createClass({displayName: 'LineToggle',
  getInitialState: function() {
    return {
      isDisabled: LineToggleStore.isDisabled(this.props.line)
    };
  },
  componentDidMount: function() {
    LineToggleStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    LineToggleStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(this.getInitialState());
    }
  },
  toggle: function() {
    var line = this.props.line;
    if (this.state.isDisabled) {
      Actions.enableLine(line);
    } else {
      Actions.disableLine(line);
    }
  },
  render: function() {
    var line = this.props.line;
    var className = "lineToggle line-" + line;
    if (this.state.isDisabled) {
      className += " disabled";
    }
    return (
      React.createElement("div", {className: className, onClick: this.toggle})
    );
  }
});

module.exports = LineToggle;

},{"../actions/Actions.js":1,"../stores/LineToggleStore.js":30}],16:[function(require,module,exports){
var LineToggle = require("./LineToggle.js");
var ArrayUtil = require("../util/ArrayUtil.js");

var LineToggleBar = React.createClass({displayName: 'LineToggleBar',
  render: function() {
    var stations = this.props.stations;
    var lines = [];
    stations.forEach(function(station) {
      station.StopArrivals.forEach(function(stop) {
        lines.push(stop.LineKey);
      });
    });
    lines = ArrayUtil.unique(lines);
    return (
      React.createElement("div", {className: "lineToggleBar row"}, 
        lines && (lines.length > 1) && lines.map(function(line, index) {
          return (
            React.createElement(LineToggle, {key: index, line: line})
          );
        })
      )
    );
  }
});

module.exports = LineToggleBar;

},{"../util/ArrayUtil.js":35,"./LineToggle.js":15}],17:[function(require,module,exports){
var LinesApi = require("../api/LinesApi.js");
var LineStore = require("../stores/LineStore.js");
var LocationStore = require("../stores/LocationStore.js");
var LineList = require("./LineList.js");
var SimpleStationList = require("./SimpleStationList.js");
var Station = require("./Station.js");
var Actions = require("../actions/Actions.js");
var StationApi = require("../api/StationApi.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  console.log("Lines.getState");
  return {
    loadingLines: LineStore.loadingLines(),
    lines: LineStore.lines(),
    currentLine: LineStore.currentLine(),
    loadingStations: LineStore.loadingStations(),
    stations: LineStore.stations(),
    loadingStation: LineStore.loadingStation(),
    currentStation: LineStore.currentStation()
  };
}

function backToLines() {
  Actions.backToLines();
}

function backToLine() {
  Actions.backToLine();
}

var Lines = React.createClass({displayName: 'Lines',
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Lines.componentDidMount");
    LineStore.addChangeListener(this._onChange);
    LinesApi.load();
  },
  componentWillUnmount: function() {
    LineStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  refreshStation: function() {
    StationApi.load(this.state.currentStation, LocationStore.latitude(), LocationStore.longitude());
  },
  render: function() {
    console.log("Lines.render");
    var content;
    if (this.state.loadingLines) {
      content = React.createElement(Loading, {msg: "Loading Lines"})
    } else if (this.state.loadingStations) {
      content = React.createElement(Loading, {msg: "Loading Stations"})
    } else if (this.state.loadingStation) {
      content = React.createElement(Loading, {msg: "Loading Station"})
    } else if (this.state.currentLine == null) {
      content = React.createElement(LineList, {lines: this.state.lines});
    } else if (this.state.currentStation != null) {
      content = (
        React.createElement("div", null, 
          React.createElement("div", {className: "row split"}, 
            React.createElement("button", {onClick: backToLine}, React.createElement(Icon, {icon: "chevron-left"})), 
            React.createElement(LineToggleBar, {stations: [this.state.currentStation]}), 
            React.createElement("button", {onClick: this.refreshStation}, React.createElement(Icon, {icon: "reload"}))
          ), 
          React.createElement(Station, {station: this.state.currentStation})
        )
      );
    } else {
      content = (
        React.createElement("div", null, 
          React.createElement("div", {className: "row split"}, 
            React.createElement("button", {onClick: backToLines}, React.createElement(Icon, {icon: "chevron-left"}))
          ), 
          React.createElement(SimpleStationList, {stations: this.state.stations})
        )
      );
    }
    return (
      React.createElement("div", {className: "lines"}, 
        content
      )
    );
  }
});

module.exports = Lines;

},{"../actions/Actions.js":1,"../api/LinesApi.js":2,"../api/StationApi.js":4,"../stores/LineStore.js":29,"../stores/LocationStore.js":31,"./Icon.js":12,"./LineList.js":14,"./LineToggleBar.js":16,"./Loading.js":18,"./SimpleStationList.js":22,"./Station.js":23}],18:[function(require,module,exports){
var Loading = React.createClass({displayName: 'Loading',
  render: function() {
    return (
      React.createElement("div", {className: "loading center"}, 
        this.props.msg
      )
    );
  }
});

module.exports = Loading;

},{}],19:[function(require,module,exports){
var TabStore = require("../stores/TabStore.js");
var Nearby = require("./Nearby.js");
var Lines = require("./Lines.js");
var Favorites = require("./Favorites.js");
var Actions = require("../actions/Actions.js");
var Icon = require("./Icon.js");

function gotoNearby() {
  Actions.switchTab("nearby");
}

function gotoLines() {
  Actions.switchTab("lines");
}

function gotoFavorites() {
  Actions.switchTab("favorites");
}

function getState() {
  console.log("Main.getState");
  return {
    tab: TabStore.current()
  };
}

var Main = React.createClass({displayName: 'Main',
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    TabStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TabStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  render: function() {
    var content;
    var nearbyClass = linesClass = favoritesClass = "tab";
    var nearbyIconClass = linesIconClass = favoritesIconClass = "";
    switch (this.state.tab) {
      case "nearby":
        nearbyClass += " selected";
        nearbyIconClass += " selected";
        content = React.createElement(Nearby, null);
        break;
      case "lines":
        linesClass += " selected";
        linesIconClass += " selected";
        content = React.createElement(Lines, null);
        break;
      case "favorites":
        favoritesClass += " selected";
        favoritesIconClass += " selected";
        content = React.createElement(Favorites, null);
        break;
    }
    return (
      React.createElement("div", {className: "main"}, 
        React.createElement("div", {className: "tabs row"}, 
          React.createElement("div", {className: nearbyClass, onClick: gotoNearby}, 
            React.createElement(Icon, {icon: "map-marker", outerClassName: "icon", innerClassName: nearbyIconClass})
          ), 
          React.createElement("div", {className: linesClass, onClick: gotoLines}, 
            React.createElement(Icon, {icon: "list", outerClassName: "icon", innerClassName: linesIconClass})
          ), 
          React.createElement("div", {className: favoritesClass, onClick: gotoFavorites}, 
            React.createElement(Icon, {icon: "star", outerClassName: "icon", innerClassName: favoritesIconClass})
          )
        ), 
        content
      )
    );
  }
});

module.exports = Main;

},{"../actions/Actions.js":1,"../stores/TabStore.js":34,"./Favorites.js":11,"./Icon.js":12,"./Lines.js":17,"./Nearby.js":20}],20:[function(require,module,exports){
var LocationUtil = require("../util/LocationUtil.js");
var LocationStore = require("../stores/LocationStore.js");
var NearbyStore = require("../stores/NearbyStore.js");
var Stations = require("./Stations.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  console.log("Nearby.getState");
  return {
    loadingLocation: LocationStore.loading(),
    latitude: LocationStore.latitude(),
    longitude: LocationStore.longitude(),
    loadingStations: NearbyStore.loading(),
    stations: NearbyStore.stations()
  };
}

function refresh() {
  console.log("refresh");
  LocationUtil.get();
}

var Nearby = React.createClass({displayName: 'Nearby',
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Nearby.mount");
    NearbyStore.addChangeListener(this._onChange);
    LocationStore.addChangeListener(this._onChange);
    LocationUtil.get();
  },
  componentWillUnmount: function() {
    console.log("Nearby.unmount");
    NearbyStore.removeChangeListener(this._onChange);
    LocationStore.removeChangeListener(this._onChange);
  },
  _onChange: function(x) {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  render: function() {
    var content;
    if (this.state.loadingLocation) {
      content = React.createElement(Loading, {msg: "Loading Location"})
    } else if (this.state.loadingStations) {
      content = React.createElement(Loading, {msg: "Loading Stations"})
    } else if (this.state.stations.length == 0) {
      content = React.createElement("div", {className: "center"}, "No Nearby Stations");
    } else {
      content = (
        React.createElement("div", null, 
          React.createElement("div", {className: "row split"}, 
            React.createElement("button", {className: "hidden"}, React.createElement(Icon, {icon: "reload"})), 
            React.createElement(LineToggleBar, {stations: this.state.stations}), 
            React.createElement("button", {className: "refresh", onClick: refresh}, React.createElement(Icon, {icon: "reload"}))
          ), 
          React.createElement(Stations, {stations: this.state.stations})
        )
      );
    }
    return (
      React.createElement("div", {className: "nearby"}, 
        content
      )
    );
  }
});

module.exports = Nearby;

},{"../stores/LocationStore.js":31,"../stores/NearbyStore.js":32,"../util/LocationUtil.js":36,"./Icon.js":12,"./LineToggleBar.js":16,"./Loading.js":18,"./Stations.js":24}],21:[function(require,module,exports){
var Actions = require("../actions/Actions.js");
var Distance = require("./Distance.js");

var SimpleStation = React.createClass({displayName: 'SimpleStation',
  _onClick: function() {
    Actions.chooseStation(this.props.station);
  },
  render: function() {
    var station = this.props.station;
    return (
      React.createElement("div", {className: "simpleStation row split", onClick: this._onClick}, 
        React.createElement("p", null, station.Name), 
        React.createElement(Distance, {km: station.Kilometers})
      )
    );
  }
});

module.exports = SimpleStation;

},{"../actions/Actions.js":1,"./Distance.js":10}],22:[function(require,module,exports){
var SimpleStation = require("./SimpleStation.js");

var SimpleStationList = React.createClass({displayName: 'SimpleStationList',
  render: function() {
    return (
      React.createElement("div", {className: "simpleStationList"}, 
        this.props.stations.map(function(station, index) {
          return React.createElement(SimpleStation, {key: index, station: station});
        })
      )
    );
  }
});

module.exports = SimpleStationList;

},{"./SimpleStation.js":21}],23:[function(require,module,exports){
var Stops = require("./Stops.js");
var Distance = require("./Distance.js");

var Station = React.createClass({displayName: 'Station',
  render: function() {
    var station = this.props.station;
    return (
      React.createElement("div", {className: "station"}, 
        React.createElement("div", {className: "row split"}, 
          React.createElement("span", {className: "name"}, station.Name), 
          React.createElement(Distance, {km: station.Kilometers})
        ), 
        station.StopArrivals && React.createElement(Stops, {stops: station.StopArrivals, onlyFavorites: this.props.onlyFavorites})
      )
    );
  }
});

module.exports = Station;

},{"./Distance.js":10,"./Stops.js":26}],24:[function(require,module,exports){
var Station = require("./Station.js");

var Stations = React.createClass({displayName: 'Stations',
  render: function() {
    return (
      React.createElement("div", {className: "stations"}, 
        this.props.stations.map(function(station, index) {
          return React.createElement(Station, {key: index, station: station, onlyFavorites: this.props.onlyFavorites});
        }.bind(this))
      )
    );
  }
});

module.exports = Stations;

},{"./Station.js":23}],25:[function(require,module,exports){
var Arrivals = require("./Arrivals.js");
var FavoriteStore = require("../stores/FavoriteStore.js");
var LineToggleStore = require("../stores/LineToggleStore.js");
var Actions = require("../actions/Actions.js");
var Icon = require("./Icon.js");

var Stop = React.createClass({displayName: 'Stop',
  getInitialState: function() {
    return {
      isFavorite: FavoriteStore.isFavorite(this.props.stop),
      isDisabled: LineToggleStore.isDisabled(this.props.stop.LineKey)
    };
  },
  componentDidMount: function() {
    FavoriteStore.addChangeListener(this._onChange);
    LineToggleStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    FavoriteStore.removeChangeListener(this._onChange);
    LineToggleStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(this.getInitialState());
    }
  },
  toggleFavorite: function() {
    if (this.state.isFavorite) {
      Actions.removeFavorite(this.props.stop);
    } else {
      Actions.addFavorite(this.props.stop);
    }
  },
  render: function() {
    var stop = this.props.stop;
    var favIcon;
    if (this.state.isFavorite) {
      favIcon = "isFavorite";
    } else {
      favIcon = "notFavorite";
    }
    var lineClass = "row split line line-" + stop.LineKey;
    if (!this.state.isDisabled && (!this.props.onlyFavorites || this.state.isFavorite)) {
      return (
        React.createElement("div", {className: "stop"}, 
          React.createElement("div", {className: lineClass}, 
            React.createElement("span", null, stop.Name), 
            React.createElement("button", {onClick: this.toggleFavorite}, React.createElement(Icon, {icon: "star", innerClassName: favIcon}))
          ), 
          stop.Arrivals && React.createElement(Arrivals, {stop: stop, arrivals: stop.Arrivals})
        )
      );
    } else {
      return null;
    }
  }
});

module.exports = Stop;

},{"../actions/Actions.js":1,"../stores/FavoriteStore.js":28,"../stores/LineToggleStore.js":30,"./Arrivals.js":9,"./Icon.js":12}],26:[function(require,module,exports){
var Stop = require("./Stop.js");

var Stops = React.createClass({displayName: 'Stops',
  render: function() {
    var stops = this.props.stops;
    return (
      React.createElement("div", {className: "stops"}, 
        stops.map(function(stop, index) {
          return React.createElement(Stop, {key: index, stop: stop, onlyFavorites: this.props.onlyFavorites});
        }.bind(this))
      )
    );
  }
});

module.exports = Stops;

},{"./Stop.js":25}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
console.log("FavoriteStore");
var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var favoriteStops = read();
var loading = false;
var stations = [];

function supportsStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch(e) {
    return false;
  }
}

function read() {
  var stored = localStorage["favoriteStops"];
  if (stored) {
    return JSON.parse(stored);
  } else {
    return {};
  }
}

function write(blob) {
  localStorage["favoriteStops"] = JSON.stringify(blob);
}

var FavoriteStore = $.extend({
  stopIds: function() {
    var ids = [];
    for (var lineKey in favoriteStops) {
      for (var stopId in favoriteStops[lineKey]) {
        ids.push(stopId);
      }
    }
    return ids;
  },
  loading: function() {
    return loading;
  },
  stations: function() {
    return stations;
  },
  isFavorite: function(stop) {
    if (favoriteStops[stop.LineKey]) {
      if (favoriteStops[stop.LineKey][stop.StopId]) {
        return true;
      }
    }
    return false;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "ADD_FAVORITE":
      var stop = action.stop;
      if (!FavoriteStore.isFavorite(stop)) {
        if (!favoriteStops[stop.LineKey]) {
          favoriteStops[stop.LineKey] = {};
        }
        favoriteStops[stop.LineKey][stop.StopId] = true;
      }
      write(favoriteStops);
      break;
    case "REMOVE_FAVORITE":
      var stop = action.stop;
      if (FavoriteStore.isFavorite(stop)) {
        delete favoriteStops[stop.LineKey][stop.StopId];
      }
      write(favoriteStops);
      break;
    case "LOADING_STOPS":
      loading = true;
      break;
    case "GOT_STOPS":
      stations = action.stations;
      loading = false;
      break;
    default: return;
  }
  FavoriteStore.emitChange();
});

module.exports = FavoriteStore;

},{"../dispatcher/Dispatcher.js":27,"./Store.js":33}],29:[function(require,module,exports){
var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var StationsApi = require("../api/StationsApi.js");
var StationApi = require("../api/StationApi.js");
var LocationStore = require("./LocationStore.js");

var loadingLines = false;
var lines = [];
var currentLine = null;
var loadingStations = false;
var stations = [];
var loadingStation = false;
var currentStation = null;

var LineStore = $.extend({
  loadingLines: function() {
    return loadingLines;
  },
  lines: function() {
    return lines;
  },
  currentLine: function() {
    return currentLine;
  },
  loadingStations: function() {
    return loadingStations;
  },
  stations: function() {
    return stations;
  },
  loadingStation: function() {
    return loadingStation;
  },
  currentStation: function() {
    return currentStation;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "LOADING_LINES":
      loadingLines = true;
      currentLine = null;
      currentStation = null;
      break;
    case "GOT_LINES":
      lines = action.lines;
      loadingLines = false;
      break;
    case "CHOOSE_LINE":
      currentLine = action.line;
      StationsApi.load(currentLine, LocationStore.latitude(), LocationStore.longitude());
      break;
    case "LOADING_STATIONS":
      loadingStations = true;
      break;
    case "GOT_STATIONS":
      stations = action.stations;
      loadingStations = false;
      break;
    case "CHOOSE_STATION":
      StationApi.load(action.station, LocationStore.latitude(), LocationStore.longitude());
      break;
    case "LOADING_STATION":
      loadingStation = true;
      break;
    case "GOT_STATION":
      currentStation = action.station;
      loadingStation = false;
      break;
    case "BACK_TO_LINES":
      currentLine = null;
      currentStation = null;
      break;
    case "BACK_TO_LINE":
      currentStation = null;
      break;
    default: return;
  }
  LineStore.emitChange();
});

module.exports = LineStore;

},{"../api/StationApi.js":4,"../api/StationsApi.js":5,"../dispatcher/Dispatcher.js":27,"./LocationStore.js":31,"./Store.js":33}],30:[function(require,module,exports){
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

},{"../dispatcher/Dispatcher.js":27,"./Store.js":33}],31:[function(require,module,exports){
var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");

var loading = false;
var latitude = null;
var longitude = null;

var LocationStore = $.extend({
  loading: function() {
    return loading;
  },
  latitude: function() {
    return latitude;
  },
  longitude: function() {
    return longitude;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "LOADING_LOCATION":
      loading = true;
      break;
    case "GOT_LOCATION":
      latitude = action.latitude;
      longitude = action.longitude;
      loading = false;
      break;
    default:
      return;
  }
  LocationStore.emitChange();
});

module.exports = LocationStore;

},{"../dispatcher/Dispatcher.js":27,"./Store.js":33}],32:[function(require,module,exports){
var Store = require("./Store.js");
var Dispatcher = require("../dispatcher/Dispatcher.js");
var NearbyApi = require("../api/NearbyApi.js");

var loading = false;
var stations = [];

var NearbyStore = $.extend({
  loading: function() {
    return loading;
  },
  stations: function() {
    return stations;
  }
}, Store());

Dispatcher.register(function(action) {
  switch (action.type) {
    case "GOT_LOCATION":
      NearbyApi.load(action.latitude, action.longitude);
      break;
    case "LOADING_NEARBY_STATIONS":
      loading = true;
      break;
    case "GOT_NEARBY_STATIONS":
      stations = action.stations;
      loading = false;
      break;
    default: return;
  }
  NearbyStore.emitChange();
});

module.exports = NearbyStore;

},{"../api/NearbyApi.js":3,"../dispatcher/Dispatcher.js":27,"./Store.js":33}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{"../dispatcher/Dispatcher.js":27,"./Store.js":33}],35:[function(require,module,exports){
var ArrayUtil = {
  unique: function(arr) {
    var i,
        len=arr.length,
        out=[],
        obj={};

    for (i=0;i<len;i++) {
      obj[arr[i]]=0;
    }
    for (i in obj) {
      out.push(i);
    }
    return out;
  }
};

module.exports = ArrayUtil;

},{}],36:[function(require,module,exports){
var Actions = require("../actions/Actions.js");

var LocationUtil = {
  available: function() {
    return navigator.geolocation;
  },
  get: function() {
    console.log("LocationUtil.get");
    if (this.available()) {
      Actions.loadingLocation();
      navigator.geolocation.getCurrentPosition(function(pos) {
        console.log("got location", pos.coords);
        Actions.gotLocation(pos.coords.latitude, pos.coords.longitude);
      }, function(msg) {
        Actions.locationFailed(msg);
      });
    } else {
      Actions.locationUnavailable();
    }
  }
};

module.exports = LocationUtil;

},{"../actions/Actions.js":1}]},{},[7]);
