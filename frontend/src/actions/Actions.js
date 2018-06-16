import {store} from "../store/Store";

export function initialLoad() {
  store.dispatch({
    type: "INITIAL_LOAD",
  });
}

export function switchTab(tab) {
  store.dispatch({
    type: "SWITCH_TAB",
    tab: tab
  });
}

export function loadLocation() {
  store.dispatch({
    type: "LOAD_LOCATION",
  });
}

export function loadingLocation() {
    store.dispatch({
      type: "LOADING_LOCATION"
    });
}
  
export function gotLocation(latitude, longitude) {
    store.dispatch({
      type: "GOT_LOCATION",
      latitude: latitude,
      longitude: longitude
    });
}
  
export function locationFailed(msg) {
    store.dispatch({
      type: "LOCATION_FAILED",
      msg: msg
    });
}
  
export function locationUnavailable() {
    store.dispatch({
      type: "LOCATION_UNAVAILABLE"
    });
}

export function loadingNearbyStations() {
    store.dispatch({
      type: "LOADING_NEARBY_STATIONS"
    });
}

export function gotNearbyStations(stations) {
    store.dispatch({
      type: "GOT_NEARBY_STATIONS",
      stations: stations
    });
}

export function loadingLines() {
    store.dispatch({
      type: "LOADING_LINES"
    });
}

export function gotLines(lines) {
    store.dispatch({
      type: "GOT_LINES",
      lines: lines
    });
}

export function chooseLine(line) {
    store.dispatch({
      type: "CHOOSE_LINE",
      line: line
    });
}

export function loadingStations() {
    store.dispatch({
      type: "LOADING_STATIONS"
    });
}

export function gotStations(stations) {
    store.dispatch({
      type: "GOT_STATIONS",
      stations: stations
    });
}

export function chooseStation(station) {
    store.dispatch({
      type: "CHOOSE_STATION",
      station: station
    });
}

export function loadingStation() {
    store.dispatch({
      type: "LOADING_STATION"
    });
}

export function gotStation(station) {
    store.dispatch({
      type: "GOT_STATION",
      station: station
    });
}

export function backToLines() {
    store.dispatch({
      type: "BACK_TO_LINES"
    });
}

export function backToLine() {
    store.dispatch({
      type: "BACK_TO_LINE"
    });
}

export function loadingStops() {
    store.dispatch({
      type: "LOADING_STOPS"
    });
}

export function gotStops(stations) {
    store.dispatch({
      type: "GOT_STOPS",
      stations: stations
    });
}
