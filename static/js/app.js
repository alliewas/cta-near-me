// App

window.CTA = angular.module("cta", []);
window.State = statechart.State;

// State

CTA.service("$state", function() {
  return {};
});

CTA.service("$statechart", function($state, $rootScope, $location, $anchorScroll, Location, LineService, FavoritesService) {
  var scrollUp = function() {
    $anchorScroll();
  }

  return State.define(function() {
    this.trace = true;

    this.state("nearby", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "nearby";
        $state.loadable = true;
        $state.toggleable = true;
        this.send("getLocation");
      });
      this.exit(function() {
        $rootScope.$broadcast("Tabs.change");
        $state.loadable = false;
        $state.toggleable = false;
      });

      this.event("getLocation", function() {
        if (Location.available()) {
          this.goto("loading-geo");
          Location.get();
        } else {
          this.goto("no-geo");
        }
      });

      this.state("loading-geo", function() {
        this.enter(function() {
          $state.loading = true;
        });
        this.exit(function() {
          $state.loading = false;
        });
      });
      this.state("no-geo", function() {
      });
      this.state("geo-error", function() {
      });
      this.state("loading-data", function() {
        this.enter(function() {
          $state.loading = true;
        });
        this.exit(function() {
          $state.loading = false;
        });
      });
      this.state("has-stations", function() {
      });
      this.state("empty-stations", function() {
      });
      this.state("error", function() {
      });
    });
    this.state("tracks", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "tracks";
        $state.toggleable = true;
        this.send("loadLines");
      });
      this.exit(function() {
        $state.toggleable = false;
        $rootScope.$broadcast("Tabs.change");
      });

      this.event("loadLines", function() {
        LineService.load();
      });

      this.state("loading-lines", function() {
      });
      this.state("lines", function() {
      });
      this.state("loading-stations", function() {
      });
      this.state("stations", function() {
      });
      this.state("loading-station", function() {
        this.enter(function() {
          $state.loadable = true;
          $state.loading = true;
        });
        this.exit(function() {
          $state.loadable = false;
          $state.loading = false;
        });
      });
      this.state("station", function() {
        this.enter(function() {
          $state.loadable = true;
        });
        this.exit(function() {
          $state.loadable = false;
        });
      });
      this.state("error", function() {
      });
    });
    this.state("favorites", function() {
      this.enter(function() {
        scrollUp();
        $state.show = "favorites";
        $state.loadable = true;
        $state.toggleable = false;
        this.send("loadFavorites");
      });
      this.exit(function() {
        $state.loadable = false;
        $rootScope.$broadcast("Tabs.change");
      });

      this.event("loadFavorites", function() {
        FavoritesService.load();
      });

      this.state("loading", function() {
        this.enter(function() {
          $state.loading = true;
        })
        this.exit(function() {
          $state.loading = false;
        });
      });
      this.state("error", function() {
      });
      this.state("favorites", function() {
      });
      this.state("no-favorites", function() {
      });
    });
  });
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

CTA.service("Location", function($rootScope) {
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
      $rootScope.$broadcast("Location.success");
    },

    error: function(msg) {
      $rootScope.$broadcast("Location.error");
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
  $rootScope.$on("Tabs.change", function() {
    service.clearCurrent();
  });
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
    clear: function() {
      service.current = null;
      service.list = null;
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
  $rootScope.$on("Tabs.change", function() {
    service.clear();
  });
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
      if (StationService.current) {
        return StationService.current.lines();
      } else if (StationService.list) {
        return StationService.linesForList();
      } else {
        return [];
      }
    }
  };
  $rootScope.$on("Tabs.change", function() {
    service.clear();
  });
  return service;
});

// Header

CTA.controller("HeaderCtrl", function($scope, $rootScope, $state, $statechart) {
  console.log("HeaderCtrl");
  $scope.$state = $state;

  $scope.show = function(tab) {
    return $state.show == tab;
  }

  $scope.goto = function(tab) {
    return $statechart.goto(tab);
  }

  $scope.reload = function() {
    $rootScope.$broadcast("reload");
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

CTA.controller("FooterCtrl", function($scope, $rootScope, Loading, LineToggle, $state) {
  $scope.$state = $state;

  $scope.reload = function() {
    $rootScope.$broadcast("reload");
  }

  $scope.showToggle = function() {
    return $state.toggleable && !$state.loading && (LineToggle.lines().length > 1);
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

CTA.controller("NearbyCtrl", function($scope, $state, $statechart, Analytics, StationService, Loading, Location, LineToggle, FavoritesService) {
  console.log("NearbyCtrl");

  $scope.$state = $state;

  $scope.$on("Location.success", function() {
    StationService.loadNearby();
  });
  $scope.$on("Location.error", function() {
    $statechart.goto("/nearby/geo-error");
  });

  $scope.substate = function(name) {
    return $statechart.isCurrent("/nearby/" + name);
  }

  $scope.$on("StationService.nearby.loading", function() {
    $statechart.goto("/nearby/loading-data");
  });
  $scope.$on("StationService.nearby.error", function() {
    $statechart.goto("/nearby/error");
  });
  $scope.$watch(function(){ return StationService.list; }, function(stations) {
    $scope.stations = stations;
    if (stations) {
      if (stations.length > 0) {
        $statechart.goto("/nearby/has-stations");
      } else {
        $statechart.goto("/nearby/empty-stations");
      }
    }
  });

  $scope.isStopHidden = function(stop) {
    return LineToggle.isDisabled(stop.LineKey);
  }

  $scope.gotoStation = function(station) {
    $statechart.goto("/tracks/loading-station");
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
    if ($statechart.isCurrent("/nearby")) {
      $statechart.send("getLocation");
    }
  });
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

CTA.controller("TracksCtrl", function($scope, $state, $statechart, Analytics, LineService, StationService, Loading, Location, LineToggle, FavoritesService) {
  console.log("TracksCtrl");

  $scope.$state = $state;
  $scope.substate = function(name) {
    return $statechart.isCurrent("/tracks/" + name);
  }

  $scope.loadLines = function() {
    $statechart.send("loadLines");
  }

  $scope.$on("LineService.loading", function() {
    $statechart.goto("/tracks/loading-lines");
  });
  $scope.$on("LineService.success", function() {
    $statechart.goto("/tracks/lines");
  });
  $scope.$on("LineService.error", function() {
    $statechart.goto("/tracks/error");
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
    $statechart.goto("/tracks/loading-stations");
  });
  $scope.$on("StationService.list.success", function() {
    $statechart.goto("/tracks/stations");
  });
  $scope.$on("StationService.list.error", function() {
    $statechart.goto("/tracks/error");
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
    $statechart.goto("/tracks/loading-station");
  });
  $scope.$on("StationService.current.success", function() {
    $statechart.goto("/tracks/station");
  });
  $scope.$on("StationService.current.error", function() {
    $statechart.goto("/tracks/error");
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
    if ($statechart.isCurrent("/tracks/station")) {
      $scope.loadStation(StationService.current);
    }
  });
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

CTA.controller("FavoritesCtrl", function($scope, $state, $statechart, Loading, LineToggle, FavoritesService, StationService) {
  $scope.substate = function(name) {
    return $statechart.isCurrent("/favorites/" + name);
  }
  $scope.load = function() {
    FavoritesService.load();
  };

  $scope.$on("FavoritesService.loading", function() {
    $statechart.goto("/favorites/loading");
  });
  $scope.$on("FavoritesService.error", function() {
    $statechart.goto("/favorites/error");
  });
  $scope.$watch(function(){ return FavoritesService.stations; }, function(stations) {
    $scope.stations = stations;
    if (stations) {
      if (stations.length > 0) {
        $statechart.goto("/favorites/favorites");
      } else {
        $statechart.goto("/favorites/no-favorites");
      }
    }
  });

  $scope.$on("reload", function() {
    if ($statechart.isCurrent("/favorites")) {
      $scope.load();
    }
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
