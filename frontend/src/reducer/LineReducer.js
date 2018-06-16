import {reduceState as r, buildReducer} from "../util/Util";

function initialLoad(state={}, action) {
    return r(state, {
        loadingLines: false,
        lines: [],
        currentLine: null,
        loadingStations: false,
        stations: [],
        loadingStation: false,
        currentStation: null,
    })
}

function loadingLines(state={}, action) {
    return r(state, {
        loadingLines: true,
        currentLine: null,
        currentStation: null,
    });
}

function gotLines(state={}, action) {
    return r(state, {
        loadingLines: false,
        lines: action.lines.slice(),
    });
}

function chooseLine(state={}, action) {
    return r(state, {
        currentLine: action.line,
    });
}

function loadingStations(state={}, action) {
    return r(state, {
        loadingStations: true,
    });
}

function gotStations(state={}, action) {
    return r(state, {
        loadingStations: false,
        stations: action.stations.slice(),
    });
}

function loadingStation(state={}, action) {
    return r(state, {
        loadingStation: true,
    });
}

function gotStation(state={}, action) {
    return r(state, {
        loadingStation: false,
        currentStation: action.station,
    });
}

function backToLines(state={}, action) {
    return r(state, {
        currentLine: null,
        currentStation: null,
    });
}

function backToLine(state={}, action) {
    return r(state, {
        currentStation: null,
    });
}

export const lineReducer = buildReducer({
    INITIAL_LOAD: initialLoad,
    LOADING_LINES: loadingLines,
    GOT_LINES: gotLines,
    CHOOSE_LINE: chooseLine,
    LOADING_STATIONS: loadingStations,
    GOT_STATIONS: gotStations,
    LOADING_STATION: loadingStation,
    GOT_STATION: gotStation,
    BACK_TO_LINES: backToLines,
    BACK_TO_LINE: backToLine,
});