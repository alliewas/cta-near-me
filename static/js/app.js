// App

window.CTA = angular.module("cta", []);

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
  return service;
});

// Station

CTA.service("StationService", function($rootScope, $http, Location) {
  var service = {
    current: null,
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
          service.current = response;
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
          service.list = response;
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
          service.list = response;
        }).error(function() {
          console.log("error");
          $rootScope.$broadcast("StationService.nearby.error");
        });
      }
    }
  };
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

CTA.service("Tabs", function($rootScope, $location, $anchorScroll, LineService) {
  var service = {
    current: "nearby",

    nearby: function() {
      return service.current == "nearby";
    },

    tracks: function() {
      return service.current == "tracks";
    },

    set: function(tab, skipBroadcast) {
      service.current = tab;
      $location.hash("top");
      $anchorScroll();
      LineService.clearCurrent();
      if (!skipBroadcast) {
        $rootScope.$broadcast("Tabs." + tab);
      }
    }
  };
  return service;
});

CTA.controller("TabsCtrl", function($scope, Tabs) {
  $scope.Tabs = Tabs;
});

// Header

CTA.controller("HeaderCtrl", function($scope, Bus, Tabs) {
  console.log("HeaderCtrl");

  $scope.Tabs = Tabs;

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

CTA.controller("FooterCtrl", function($scope, Bus, Loading) {
  $scope.Loading = Loading;

  $scope.reload = function() {
    Bus.broadcast("reload");
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

CTA.controller("NearbyCtrl", function($scope, Bus, Analytics, Tabs, StationService, Loading, Location) {
  console.log("NearbyCtrl");

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

  $scope.gotoStation = function(station) {
    Tabs.set("tracks", true);
    StationService.current = station;
    StationService.loadStation(station);
  }

  $scope.$on("reload", function() {
    if (Tabs.nearby()) {
      $scope.getLocation();
    }
  });

  $scope.$on("Tabs.nearby", function() {
    $scope.getLocation();
  });

  $scope.$watch("state", function() {
    Loading.loadable = true;
    Loading.loading = (["loading-geo", "loading-data"].indexOf($scope.state) != -1);
  });

  if (Tabs.nearby()) {
    $scope.getLocation();
  }
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

CTA.controller("TracksCtrl", function($scope, Bus, Analytics, Tabs, LineService, StationService, Loading, Location) {
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

  $scope.$on("reload", function() {
    if (Tabs.tracks()) {
      switch($scope.state) {
        case "station":
          $scope.loadStation(StationService.current);
          break;
      }
    }
  });

  $scope.$on("Tabs.tracks", function() {
    $scope.loadLines();
  });

  $scope.$watch("state", function() {
    Loading.loadable = (["station", "loading-station", "error"].indexOf($scope.state) != -1);
    Loading.loading = (["loading-lines", "loading-stations", "loading-station"].indexOf($scope.state) != -1);
  });

  if (Tabs.tracks()) {
    $scope.loadLines();
  }
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
