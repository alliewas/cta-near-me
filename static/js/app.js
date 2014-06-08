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

// Tabs

CTA.service("Tabs", ["$rootScope", function($rootScope) {
  var service = {
    current: "nearby",

    nearby: function() {
      return service.current == "nearby";
    },

    tracks: function() {
      return service.current == "tracks";
    },

    set: function(tab) {
      service.current = tab;
      $rootScope.$broadcast("Tabs." + tab);
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
}]);

// Footer

CTA.controller("FooterCtrl", ["$scope", "Bus", function($scope, Bus) {
  $scope.reload = function() {
    Bus.broadcast("reload");
  }
}]);

// Nearby

CTA.controller("NearbyCtrl", ["$scope", "$http", "Bus", "Tabs", function($scope, $http, Bus, Tabs) {
  console.log("NearbyCtrl");

  $scope.state = null; // loading-geo, no-geo, loading-data, has-stations, empty-stations, error
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
    $scope.state = "error";
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

  $scope.$on("reload", function() {
    if (Tabs.nearby()) {
      $scope.getLocation();
    }
  });

  $scope.$on("Tabs.nearby", function() {
    $scope.getLocation();
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

CTA.controller("TracksCtrl", ["$scope", "$http", "Bus", "Tabs", function($scope, $http, Bus, Tabs) {
  console.log("TracksCtrl");

  $scope.state = null; // loading-lines, lines, loading-stations, stations, loading-station, station, error
  //$scope.currentLineKey = null;

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
      $scope.currentLine = line;
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
      $scope.currentStation = station;
      $scope.state = "loading-station";
      $http({
        method: "GET", url: "/api/station", params: {
          line: station.LineKey,
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

  $scope.$on("reload", function() {
    if (Tabs.tracks()) {
      switch($scope.state) {
        case "station":
          $scope.loadStation($scope.currentStation);
          break;
      }
    }
  });

  $scope.$watch("currentLineKey", function() {
    console.log("currentLineKey", $scope.currentLineKey);
    $scope.loadStations();
  });

  $scope.$on("Tabs.tracks", function() {
    $scope.loadLines();
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
