import {reduceState as r, buildReducer} from "../util/Util";

function initialLoad(state={}, action) {
    return r(state, {
        currentTab: "nearby",
    });
}

function switchTab(state={}, action) {
    return r(state, {
        currentTab: action.tab,
    });
}

export const tabReducer = buildReducer({
    INITIAL_LOAD: initialLoad,
    SWITCH_TAB: switchTab,
});