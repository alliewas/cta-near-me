// App

window.CTA = angular.module("cta", []);

// Bus

CTA.factory("Bus", ["$rootScope", function($rootScope) {
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
}]);

// Line

CTA.service("Line", ["$rootScope", function($rootScope) {
  var service = {
    current: null,
    set: function(line) {
      service.current = line;
      $rootScope.$broadcast("Line.current");
    },
    clear: function() {
      service.current = null;
    }
  };
  return service;
}]);

// Station

CTA.service("Station", ["$rootScope", function($rootScope) {
  var service = {
    current: null,
    set: function(station) {
      service.current = station;
      $rootScope.$broadcast("Station.current");
    }
  };
  return service;
}]);

// Loading

CTA.service("Loading", ["$rootScope", function($rootScope) {
  var service = {
    loading: false,
    loadable: false
  };
  return service;
}]);

// Tabs

CTA.service("Tabs", ["$rootScope", "$location", "$anchorScroll", "Line", function($rootScope, $location, $anchorScroll, Line) {
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
      Line.clear();
      if (!skipBroadcast) {
        $rootScope.$broadcast("Tabs." + tab);
      }
    }
  };
  return service;
}]);

CTA.controller("TabsCtrl", ["$scope", "Tabs", function($scope, Tabs) {
  $scope.Tabs = Tabs;
}]);

// Header

CTA.controller("HeaderCtrl", ["$scope", "Bus", "Tabs", function($scope, Bus, Tabs) {
  console.log("HeaderCtrl");

  $scope.Tabs = Tabs;

  $scope.reload = function() {
    Bus.broadcast("reload");
  }

  $scope.refreshPage = function() {
    location.reload(true);
  }
}]);

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

CTA.controller("FooterCtrl", ["$scope", "Bus", "Loading", function($scope, Bus, Loading) {
  $scope.Loading = Loading;

  $scope.reload = function() {
    Bus.broadcast("reload");
  }
}]);

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

CTA.controller("NearbyCtrl", ["$scope", "$http", "Bus", "Tabs", "Station", "Loading", function($scope, $http, Bus, Tabs, Station, Loading) {
  console.log("NearbyCtrl");

  $scope.state = null; // loading-geo, no-geo, geo-error, loading-data, has-stations, empty-stations, error
  $scope.latitude = null;
  $scope.longitude = null;

  $scope.getLocation = function() {
    if (navigator.geolocation) {
      $scope.state = "loading-geo";
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    } else {
      $scope.state = "no-geo";
    }
  }

  var geoSuccess = function(position) {
    console.log("got coords");
    console.log(position.coords);
    $scope.latitude = position.coords.latitude;
    $scope.longitude = position.coords.longitude;

    $scope.load();
  }
  var geoError = function(msg) {
    console.log(msg);
    $scope.state = "geo-error";
  }

  $scope.load = function() {
    if ($scope.latitude && $scope.longitude) {
      console.log("loading!!!");
      $scope.state = "loading-data";
      $http({
        method: "GET", url: "/api/nearby", params: {
          latitude: $scope.latitude,
          longitude: $scope.longitude
        }
      }).success(function(response) {
        console.log(response);
        if (response.length > 0) {
          $scope.state = "has-stations";
        } else {
          $scope.state = "empty-stations";
        }
        $scope.stations = response;
      }).error(function() {
        console.log("error");
        $scope.state = "error";
      });
    }
  }

  $scope.gotoStation = function(station) {
    Tabs.set("tracks", true);
    Station.set(station);
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
}]);

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

CTA.controller("TracksCtrl", ["$scope", "$http", "Bus", "Tabs", "Line", "Station", "Loading", function($scope, $http, Bus, Tabs, Line, Station, Loading) {
  console.log("TracksCtrl");

  $scope.Line = Line;
  $scope.Station = Station;

  $scope.state = null; // loading-lines, lines, loading-stations, stations, loading-station, station, error

  $scope.loadLines = function() {
    console.log("loadLines");
    $scope.state = "loading-lines";
    $http({
      method: "GET", url: "/api/lines"
    }).success(function(response) {
      console.log(response);
      $scope.state = "lines";
      $scope.lines = response;
    }).error(function() {
      console.log("error");
      $scope.state = "error";
    });
  }

  $scope.loadStations = function(line) {
    if (line) {
      $scope.state = "loading-stations";
      $http({
        method: "GET", url: "/api/stations", params: {
          line: line.Key
        }
      }).success(function(response) {
        console.log(response);
        $scope.state = "stations";
        $scope.stations = response;
      }).error(function() {
        $scope.state = "error";
      });
    }
  }

  $scope.loadStation = function(station) {
    if (station) {
      $scope.state = "loading-station";
      $http({
        method: "GET", url: "/api/station", params: {
          stationId: station.StationId
        }
      }).success(function(response) {
        console.log(response);
        $scope.state = "station";
        $scope.station = response;
      }).error(function() {
        $scope.state = "error";
      });
    }
  }

  $scope.$on("Line.current", function() {
    $scope.loadStations(Line.current);
  });

  $scope.$on("Station.current", function() {
    $scope.loadStation(Station.current);
  });

  $scope.$on("reload", function() {
    if (Tabs.tracks()) {
      switch($scope.state) {
        case "station":
          $scope.loadStation(Station.current);
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
}]);

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
