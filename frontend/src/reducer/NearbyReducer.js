import {reduceState as r, buildReducer} from "../util/Util";

function initialLoad(state={}, action) {
    return r(state, {
        loading: false,
        stations: [],
    });
}

function loadingNearbyStations(state={}, action) {
    return r(state, {
        loading: true,
    });
}

function gotNearbyStations(state={}, action) {
    return r(state, {
        loading: false,
        stations: action.stations.slice(),
    });
}

export const nearbyReducer = buildReducer({
    INITIAL_LOAD: initialLoad,
    LOADING_NEARBY_STATIONS: loadingNearbyStations,
    GOT_NEARBY_STATIONS: gotNearbyStations,
});