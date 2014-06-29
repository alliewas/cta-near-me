// App

window.CTA = angular.module("cta", []);
window.State = statechart.State;

// State

CTA.service("$state", function() {
  return {};
});

CTA.service("$statechart", function($state, $rootScope, $location, $anchorScroll, Location) {
  var scrollUp = function() {
    $location.hash("top");
    $anchorScroll();
  }
  return State.define(function() {
    this.trace = true;

    this.state("nearby", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "nearby";
        //$rootScope.$broadcast("Tabs.to.nearby");
        console.log("entered nearby");
      });

      this.event("getLocation", function() {
        if (Location.available()) {
          this.goto("loading-geo");
          Location.get();
        } else {
          this.goto("no-geo");
        }
      });

      this.event("locationSuccess", function() {
        console.log("location success!!");
      });
      
      this.event("locationError", function() {
        this.goto("geo-error");
      });

      this.state("loading-geo", function() {
        this.enter(function() {
          $state.nearby = "loading-geo";
        });
      });
      this.state("no-geo", function() {
        this.enter(function() {
          $state.nearby = "no-geo";
        });
      });
      this.state("geo-error", function() {
        this.enter(function() {
          $state.nearby = "geo-error";
        });
      });
      this.state("loading-data", function() {
        this.enter(function() {
          $state.nearby = "loading-data";
        });
      });
      this.state("has-stations", function() {
        this.enter(function() {
          $state.nearby = "has-stations";
        });
      });
      this.state("empty-stations", function() {
        this.enter(function() {
          $state.nearby = "empty-stations";
        });
      });
      this.state("error", function() {
        this.enter(function() {
          $state.nearby = "error";
        });
      });
    });
    this.state("lines", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "lines";
        $rootScope.$broadcast("Tabs.to.lines");
      });
    });
    this.state("favorites", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "favorites";
        $rootScope.$broadcast("Tabs.to.favorites");
      });
    });
  });
});

// Bus

CTA.factory("Bus", function($rootScope) {
  return {
    broadcast: function(name, obj) {
      this.name = name;
      this.obj = obj;
      this.broadcastItem();
    },
    broadcastItem: function() {
      $rootScope.$broadcast(this.name);
    }
  };
});

// Analytics

CTA.service("Analytics", function($rootScope, $window) {
  var service = {
    track: function(category, action, label, value) {
      console.log("Track: ", category, action, label, value);
      $window.ga("send", "event", category, action, label, value);
    }
  };
  return service;
});

// Location

CTA.service("Location", function($rootScope, $statechart) {
  var service = {
    latitude: null,
    longitude: null,

    available: function() {
      return navigator.geolocation;
    },

    get: function() {
      navigator.geolocation.getCurrentPosition(service.success, service.error);
    },

    success: function(position) {
      service.latitude = position.coords.latitude;
      service.longitude = position.coords.longitude;
      $statechart.locationSuccess();
      //$rootScope.$broadcast("Location.success");
    },

    error: function(msg) {
      $statechart.locationError();
      //$rootScope.$broadcast("Location.error");
    }
  };
  return service;
});

// Line

CTA.service("LineService", function($rootScope, $http) {
  var service = {
    current: null,
    clearCurrent: function() {
      service.current = null;
    },
    list: [],
    load: function() {
      console.log("LineService.load");
      $rootScope.$broadcast("LineService.loading");
      $http({
        method: "GET", url: "/api/lines"
      }).success(function(response) {
        console.log(response);
        $rootScope.$broadcast("LineService.success");
        service.list = response;
      }).error(function() {
        console.log("error");
        $rootScope.$broadcast("LineService.error");
      });
    }
  };
  //$rootScope.$on("Tabs.change", function() {
  //  service.clearCurrent();
  //});
  return service;
});

// Station

CTA.factory("Station", function() {
  return function(data) {
    angular.extend(this, {
      lines: function() {
        return $.unique(this.Stops.map(function(s) {
          return s.LineKey;
        }));
      }
    }, data);
  };
});

CTA.service("StationService", function($rootScope, $http, Location, Station) {
  var service = {
    current: null,
    clearCurrent: function() {
      service.current = null;
    },
    loadStation: function(station) {
      if (station) {
        $rootScope.$broadcast("StationService.current.loading");
        $http({
          method: "GET", url: "/api/station", params: {
            stationId: station.StationId,
            latitude: Location.latitude,
            longitude: Location.longitude
          }
        }).success(function(response) {
          console.log(response);
          $rootScope.$broadcast("StationService.current.success");
          service.current = new Station(response);
        }).error(function() {
          $rootScope.$broadcast("StationService.current.error");
        });
      }
    },
    list: null,
    loadByLine: function(line) {
      if (line) {
        $rootScope.$broadcast("StationService.list.loading");
        $http({
          method: "GET", url: "/api/stations", params: {
            line: line.Key,
            latitude: Location.latitude,
            longitude: Location.longitude
          }
        }).success(function(response) {
          console.log(response);
          $rootScope.$broadcast("StationService.list.success");
          service.list = response.map(function(s){ return new Station(s); });
        }).error(function() {
          $rootScope.$broadcast("StationService.list.error");
        });
      }
    },
    loadNearby: function() {
      if (Location.latitude && Location.longitude) {
        $rootScope.$broadcast("StationService.nearby.loading");
        $http({
          method: "GET", url: "/api/nearby", params: {
            latitude: Location.latitude,
            longitude: Location.longitude
          }
        }).success(function(response) {
          console.log(response);
          $rootScope.$broadcast("StationService.nearby.success");
          service.list = response.map(function(s){ return new Station(s); });
        }).error(function() {
          console.log("error");
          $rootScope.$broadcast("StationService.nearby.error");
        });
      }
    },
    linesForList: function() {
      return $.unique([].concat.apply([], service.list.map(function(s) {
        return s.lines();
      })));
    }
  };
  //$rootScope.$on("Tabs.change", function() {
  //  service.clearCurrent();
  //});
  return service;
});

// Loading

CTA.service("Loading", function($rootScope) {
  var service = {
    loading: false,
    loadable: false
  };
  return service;
});

// Tabs

/*
CTA.service("Tabs", function($rootScope, $location, $anchorScroll) {
  var service = {
    current: "nearby",

    nearby: function() {
      return service.current == "nearby";
    },

    tracks: function() {
      return service.current == "tracks";
    },

    favorites: function() {
      return service.current == "favorites";
    },

    set: function(tab, skipBroadcast) {
      service.current = tab;
      $location.hash("top");
      $anchorScroll();
      $rootScope.$broadcast("Tabs.change");
      if (!skipBroadcast) {
        $rootScope.$broadcast("Tabs.to." + tab);
      }
    }
  };
  return service;
});

CTA.controller("TabsCtrl", function($scope, $state, $statechart) {
  console.log("TabsCtrl");
  $scope.$state = $state;
});
*/

// LineToggle

CTA.service("LineToggle", function($rootScope, StationService, FavoritesService) {
  var service = {
    whitelist: null,
    blacklist: {},
    clear: function() {
      service.whitelist = null;
      service.blacklist = {};
    },
    toggle: function(line) {
      if (service.whitelist) {
        service.lines().forEach(function(l) {
          if (l != service.whitelist) {
            service.blacklist[l] = true;
          }
        });
        service.blacklist[service.whitelist] = false;
        service.whitelist = null;
      }
      service.blacklist[line] = !service.blacklist[line];
    },
    isDisabled: function(line) {
      if (service.whitelist) {
        return line != service.whitelist;
      } else {
        return service.blacklist[line];
      }
    },
    lines: function() {
      //if (Tabs.favorites()) {
      //  return FavoritesService.linesForList();
      //} else {
        if (StationService.current) {
          return StationService.current.lines();
        } else if (StationService.list) {
          return StationService.linesForList();
        } else {
          return [];
        }
      //}
    }
  };
  //$rootScope.$on("Tabs.change", function() {
  //  service.clear();
  //});
  return service;
});

// Header

CTA.controller("HeaderCtrl", function($scope, Bus, $state, $statechart) {
  console.log("HeaderCtrl");
  $scope.$state = $state;

  $scope.show = function(tab) {
    return $state.show == tab;
  }

  $scope.goto = function(tab) {
    return $statechart.goto(tab);
  }

  $scope.reload = function() {
    Bus.broadcast("reload");
  }

  $scope.refreshPage = function() {
    location.reload(true);
  }
});

CTA.directive("header", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "HeaderCtrl",
    templateUrl: "/templates/header.html"
  };
});

// Footer

CTA.controller("FooterCtrl", function($scope, Bus, Loading, LineToggle, $state) {
  $scope.$state = $state;

  $scope.$watch(function(){ return Loading.loadable; }, function(loadable) {
    $scope.loadable = loadable;
  });
  $scope.$watch(function(){ return Loading.loading; }, function(loading) {
    $scope.loading = loading;
  });

  $scope.reload = function() {
    Bus.broadcast("reload");
  }

  $scope.lines = function() {
    return LineToggle.lines();
  }

  $scope.lineToggle = function(line) {
    LineToggle.toggle(line);
  }

  $scope.lineDisabled = function(line) {
    return LineToggle.isDisabled(line);
  }
});

CTA.directive("footer", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "FooterCtrl",
    templateUrl: "/templates/footer.html"
  };
});

// Nearby

CTA.controller("NearbyCtrl", function($scope, $state, Bus, Analytics, StationService, Loading, Location, LineToggle, FavoritesService) {
  console.log("NearbyCtrl");

  $scope.$state = $state;

  $scope.state = null; // loading-geo, no-geo, geo-error, loading-data, has-stations, empty-stations, error

  $scope.getLocation = function() {
    Analytics.track("Nearby", "getLocation");
    if (Location.available()) {
      $scope.state = "loading-geo";
      Location.get();
    } else {
      $scope.state = "no-geo";
    }
  }

  $scope.$on("Location.success", function() {
    console.log("got coords");
    $scope.load();
  });
  $scope.$on("Location.error", function() {
    console.log(msg);
    Analytics.track("Nearby", "geoError", msg);
    $scope.state = "geo-error";
  });

  $scope.load = function() {
    StationService.loadNearby();
  }

  $scope.$on("StationService.nearby.loading", function() {
    $scope.state = "loading-data";
  });
  $scope.$on("StationService.nearby.error", function() {
    $scope.state = "error";
  });
  $scope.$watch(function(){ return StationService.list; }, function(stations) {
    $scope.stations = stations;
    if (stations) {
      if (stations.length > 0) {
        $scope.state = "has-stations";
      } else {
        $scope.state = "empty-stations";
      }
    }
  });

  $scope.isStopHidden = function(stop) {
    return LineToggle.isDisabled(stop.LineKey);
  }

  $scope.gotoStation = function(station) {
    console.log("Nearby.gotoStation");
    //Tabs.set("tracks", true);
    StationService.current = station;
    StationService.loadStation(station);
  }

  $scope.toggleFavorite = function(stop) {
    console.log("toggle favorite", stop);
    FavoritesService.toggle(stop);
  };

  $scope.isFavorite = function(stop) {
    return FavoritesService.isFavorite(stop);
  };

  $scope.$on("reload", function() {
    //if (Tabs.nearby()) {
    //  $scope.getLocation();
    //}
  });

  $scope.$on("Tabs.to.nearby", function() {
    $scope.getLocation();
  });

  $scope.$watch("state", function() {
    Loading.loadable = true;
    Loading.loading = (["loading-geo", "loading-data"].indexOf($scope.state) != -1);
  });

  //if (Tabs.nearby()) {
  //  $scope.getLocation();
  //}
});

CTA.directive("nearby", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "NearbyCtrl",
    templateUrl: "/templates/nearby.html"
  };
});

// Tracks

CTA.controller("TracksCtrl", function($scope, Bus, Analytics, LineService, StationService, Loading, Location, LineToggle, FavoritesService) {
  console.log("TracksCtrl");

  $scope.state = null; // loading-lines, lines, loading-stations, stations, loading-station, station, error

  $scope.loadLines = function() {
    console.log("loadLines");
    Analytics.track("Tracks", "loadLines");
    LineService.load();
  }

  $scope.$on("LineService.loading", function() {
    $scope.state = "loading-lines";
  });
  $scope.$on("LineService.success", function() {
    $scope.state = "lines";
  });
  $scope.$on("LineService.error", function() {
    $scope.state = "error";
  });
  $scope.$watch(function(){ return LineService.list; }, function(lines) {
    $scope.lines = lines;
  });

  $scope.loadStations = function(line) {
    if (line) {
      Analytics.track("Tracks", "loadStations", line.Key);
      StationService.loadByLine(line);
    }
  }

  $scope.$on("StationService.list.loading", function() {
    $scope.state = "loading-stations";
  });
  $scope.$on("StationService.list.success", function() {
    $scope.state = "stations";
  });
  $scope.$on("StationService.list.error", function() {
    $scope.state = "error";
  });
  $scope.$watch(function(){ return StationService.list; }, function(stations) {
    $scope.stations = stations;
  });

  $scope.loadStation = function(station) {
    if (station) {
      Analytics.track("Tracks", "loadStation", station.StationId + ":" + station.Name);
      StationService.loadStation(station);
    }
  }

  $scope.$on("StationService.current.loading", function() {
    $scope.state = "loading-station";
  });
  $scope.$on("StationService.current.success", function() {
    $scope.state = "station";
  });
  $scope.$on("StationService.current.error", function() {
    $scope.state = "error";
  });

  $scope.setLine = function(line) {
    LineService.current = line;
    LineToggle.whitelist = line.Key;
    $scope.loadStations(line);
  };

  $scope.$watch(function() { return LineService.current; }, function(current) {
    $scope.currentLine = current;
  });

  $scope.setStation = function(station) {
    StationService.current = station;
    $scope.loadStation(station);
  };

  $scope.$watch(function(){ return StationService.current; }, function(current, old) {
    $scope.station = current;
  });

  $scope.toggleFavorite = function(stop) {
    console.log("toggle favorite", stop);
    FavoritesService.toggle(stop);
  };

  $scope.isFavorite = function(stop) {
    return FavoritesService.isFavorite(stop);
  };

  $scope.isStopHidden = function(stop) {
    return LineToggle.isDisabled(stop.LineKey);
  }

  $scope.$on("reload", function() {
    //if (Tabs.tracks()) {
    //  switch($scope.state) {
    //    case "station":
    //      $scope.loadStation(StationService.current);
    //      break;
    //  }
    //}
  });

  //$scope.$on("Tabs.to.tracks", function() {
  //  $scope.loadLines();
  //});

  $scope.$watch("state", function() {
    Loading.loadable = (["station", "loading-station", "error"].indexOf($scope.state) != -1);
    Loading.loading = (["loading-lines", "loading-stations", "loading-station"].indexOf($scope.state) != -1);
  });

  //if (Tabs.tracks()) {
  //  $scope.loadLines();
  //}
});

CTA.directive("tracks", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "TracksCtrl",
    templateUrl: "/templates/tracks.html"
  };
});

// Favorites

CTA.service("FavoritesService", function($rootScope, $http, Location, Station, StationService) {
  var service = {
    stops: {},
    isFavorite: function(stop) {
      if (service.stops[stop.LineKey]) {
        return service.stops[stop.LineKey][stop.StopId];
      } else {
        return false;
      }
    },
    toggle: function(stop) {
      if (service.isFavorite(stop)) {
        service.remove(stop);
      } else {
        service.add(stop);
      }
    },
    add: function(stop) {
      if (!service.isFavorite(stop)) {
        if (!service.stops[stop.LineKey]) {
          service.stops[stop.LineKey] = {};
        }
        service.stops[stop.LineKey][stop.StopId] = true;
        service.saveLocal();
      }
    },
    remove: function(stop) {
      if (service.isFavorite(stop)) {
        if (service.stops[stop.LineKey]) {
          delete service.stops[stop.LineKey][stop.StopId];
        }
        service.saveLocal();
      }
    },
    pairs: function() {
      var list = [];
      for (var lineKey in service.stops) {
        for (var stopId in service.stops[lineKey]) {
          list.push({ StopId: stopId, LineKey: lineKey });
        }
      }
      return list;
    },
    linesForList: function() {
      return $.unique(service.pairs().map(function(p) {
        return p.LineKey;
      }));
    },
    fetchLocal: function() {
      if (localStorage.favoriteStops) {
        service.stops = JSON.parse(localStorage.favoriteStops);
      } else {
        service.stops = {};
      }
    },
    saveLocal: function() {
      localStorage.favoriteStops = JSON.stringify(service.stops);
    },
    stations: [],
    load: function() {
      if (service.stops) {
        var pairs = service.pairs();
        $rootScope.$broadcast("FavoritesService.loading");
        $http({
          method: "GET", url: "/api/stops", params: {
            stopIds: pairs.map(function(s) {
              return s.StopId;
            }).join(","),
            lineKeys: pairs.map(function(s) {
              return s.LineKey;
            }).join(","),
            latitude: Location.latitude,
            longitude: Location.longitude
          }
        }).success(function(response) {
          console.log(response);
          $rootScope.$broadcast("FavoritesService.success");
          service.stations = response.map(function(s){ return new Station(s); });
        }).error(function() {
          $rootScope.$broadcast("FavoritesService.error");
        });
      }
    }
  };
  service.fetchLocal();
  return service;
});

CTA.controller("FavoritesCtrl", function($scope, Bus, Loading, LineToggle, FavoritesService, StationService) {
  $scope.load = function() {
    FavoritesService.load();
  };

  $scope.$on("FavoritesService.loading", function() {
    $scope.state = "loading";
  });
  $scope.$on("FavoritesService.error", function() {
    $scope.state = "error";
  });
  $scope.$watch(function(){ return FavoritesService.stations; }, function(stations) {
    $scope.stations = stations;
    if (stations) {
      if (stations.length > 0) {
        $scope.state = "favorites";
      } else {
        $scope.state = "no-favorites";
      }
    }
  });

  //$scope.$on("Tabs.to.favorites", function() {
  //  $scope.load();
  //});

  $scope.$on("reload", function() {
    //if (Tabs.favorites()) {
    //  $scope.load();
    //}
  });

  $scope.toggleFavorite = function(stop) {
    console.log("toggle favorite", stop);
    FavoritesService.toggle(stop);
  };

  $scope.isFavorite = function(stop) {
    return FavoritesService.isFavorite(stop);
  };

  $scope.isStopHidden = function(stop) {
    return !FavoritesService.isFavorite(stop) || LineToggle.isDisabled(stop.LineKey);
  }

  $scope.$watch("state", function() {
    Loading.loadable = true;
    Loading.loading = ("loading" == $scope.state);
  });

  //if (Tabs.favorites()) {
  //  $scope.load();
  //}
});

CTA.directive("favorites", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "FavoritesCtrl",
    templateUrl: "/templates/favorites.html"
  };
});

// Other

CTA.directive("station", function() {
  return {
    scope: true,
    templateUrl: "/templates/station.html"
  };
});

CTA.directive("spinner", function() {
  return {
    restrict: "E",
    scope: {
      message: "@"
    },
    templateUrl: "/templates/spinner.html"
  };
});

CTA.filter("kmToMiles", function() {
  return function(km) {
    return km * 0.621371;
  }
});

// Run

//CTA.run(function($statechart) {
//  $statechart.goto();
//});

// Main

CTA.controller("MainCtrl", function($scope, $state, $statechart) {
  console.log("MainCtrl");
  $scope.$state = $state;
  $statechart.goto();
});

CTA.directive("main", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {},
    controller: "MainCtrl",
    templateUrl: "/templates/main.html"
  };
});

