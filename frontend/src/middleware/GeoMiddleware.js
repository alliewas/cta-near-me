var Actions = require("../actions/Actions.js");

const DEV = false;
const PILSEN = [41.8587515, -87.6739471];
const DOWNTOWN = [41.8819904, -87.6419756];
const [DEV_LAT, DEV_LONG] = DOWNTOWN;

function loadLocation(state, action) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            console.log("got location", pos.coords);
            Actions.gotLocation(pos.coords.latitude, pos.coords.longitude);
        }, function(msg) {
            if (DEV) {
                Actions.gotLocation(DEV_LAT, DEV_LONG);
            } else {
                Actions.locationFailed(msg);
            }
        });
      } else {
        if (DEV) {
            Actions.gotLocation(DEV_LAT, DEV_LONG);
        } else {
            Actions.locationUnavailable();
        }
      }
}

function switchTab(state, action) {
    if ("nearby" == action.tab) {
        loadLocation(state, action);
    }
}

const funcs = {
    INITIAL_LOAD: loadLocation,
    LOAD_LOCATION: loadLocation,
    SWITCH_TAB: switchTab,
}

export default store => next => action => {
    let f = funcs[action.type];
    if (f) {
        let state = store.getState();
        f(state, action);
    }
}