var NearbyApi = require("../api/NearbyApi.js");
var StationsApi = require("../api/StationsApi.js");
var StationApi = require("../api/StationApi.js");
var LinesApi = require("../api/LinesApi.js");

function loadNearby(state, action) {
    NearbyApi.load(action.latitude, action.longitude);
}

function chooseLine(state, action) {
    StationsApi.load(action.line, state.location.latitude, state.location.longitude);
}

function chooseStation(state, action) {
    StationApi.load(action.station, state.location.latitude, state.location.longitude);
}

function switchTab(state, action) {
    if ("lines" == action.tab) {
        LinesApi.load();
    }
}

const funcs = {
    GOT_LOCATION: loadNearby,
    CHOOSE_LINE: chooseLine,
    CHOOSE_STATION: chooseStation,
    SWITCH_TAB: switchTab,
}

export default store => next => action => {
    let f = funcs[action.type];
    if (f) {
        let state = store.getState();
        f(state, action);
    }
}