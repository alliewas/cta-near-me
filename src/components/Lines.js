var LinesApi = require("../api/LinesApi.js");
var LineStore = require("../stores/LineStore.js");
var LocationStore = require("../stores/LocationStore.js");
var LineList = require("./LineList.js");
var SimpleStationList = require("./SimpleStationList.js");
var Station = require("./Station.js");
var Actions = require("../actions/Actions.js");
var StationApi = require("../api/StationApi.js");
var Loading = require("./Loading.js");
var Icon = require("./Icon.js");
var LineToggleBar = require("./LineToggleBar.js");

function getState() {
  console.log("Lines.getState");
  return {
    loadingLines: LineStore.state.loadingLines(),
    lines: LineStore.state.lines(),
    currentLine: LineStore.state.currentLine(),
    loadingStations: LineStore.state.loadingStations(),
    stations: LineStore.state.stations(),
    loadingStation: LineStore.state.loadingStation(),
    currentStation: LineStore.state.currentStation()
  };
}

function backToLines() {
  Actions.backToLines();
}

function backToLine() {
  Actions.backToLine();
}

var Lines = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
    console.log("Lines.componentDidMount");
    LineStore.addChangeListener(this._onChange);
    LinesApi.load();
  },
  componentWillUnmount: function() {
    LineStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    if (this.isMounted()) {
      this.setState(getState());
    }
  },
  refreshStation: function() {
    StationApi.load(this.state.currentStation, LocationStore.state.latitude(), LocationStore.state.longitude());
  },
  render: function() {
    console.log("Lines.render");
    var content;
    if (this.state.loadingLines) {
      content = <Loading msg="Loading Lines" />
    } else if (this.state.loadingStations) {
      content = <Loading msg="Loading Stations" />
    } else if (this.state.loadingStation) {
      content = <Loading msg="Loading Station" />
    } else if (this.state.currentLine == null) {
      content = <LineList lines={this.state.lines} />;
    } else if (this.state.currentStation != null) {
      content = (
        <div>
          <div className="row split">
            <button onClick={backToLine} onTouchEnd={backToLine}><Icon icon="chevron-left" /></button>
            <LineToggleBar stations={[this.state.currentStation]} />
            <button onClick={this.refreshStation} onTouchEnd={this.refreshStation}><Icon icon="reload" /></button>
          </div>
          <Station station={this.state.currentStation} />
        </div>
      );
    } else {
      content = (
        <div>
          <div className="row split">
            <button onClick={backToLines} onTouchEnd={backToLines}><Icon icon="chevron-left" /></button>
          </div>
          <SimpleStationList stations={this.state.stations} line={this.state.currentLine} />
        </div>
      );
    }
    return (
      <div className="lines">
        {content}
      </div>
    );
  }
});

module.exports = Lines;
