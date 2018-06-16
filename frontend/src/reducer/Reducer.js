import {combineReducers} from "redux";
import {lineReducer} from "./LineReducer";
import {locationReducer} from "./LocationReducer";
import {nearbyReducer} from "./NearbyReducer";
import {routeReducer} from "./RouteReducer";
import {tabReducer} from "./TabReducer";

export const rootReducer = combineReducers({
    line: lineReducer,
    location: locationReducer,
    nearby: nearbyReducer,
    route: routeReducer,
    tab: tabReducer,
});