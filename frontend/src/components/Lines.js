import React from "react";
import {connect} from "react-redux";
var Actions = require("../actions/Actions.js");
import LineList from "./LineList.js";
import SimpleStationList from "./SimpleStationList.js";
import Station from "./Station.js";
import Loading from "./Loading.js";
import Icon from "./Icon.js";

function mapStateToProps(state) {
  return {
    loadingLines: state.line.loadingLines,
    lines: state.line.lines,
    currentLine: state.line.currentLine,
    loadingStations: state.line.loadingStations,
    stations: state.line.stations,
    loadingStation: state.line.loadingStation,
    currentStation: state.line.currentStation,
  };
}

function backToLines() {
  Actions.backToLines();
}

function backToLine() {
  Actions.backToLine();
}

class PureLines extends React.PureComponent {
  constructor(props) {
    super(props);
    this.refreshStation = this.refreshStation.bind(this);
  }
  
  refreshStation() {
    Actions.chooseStation(this.props.currentStation);
  }
  
  render() {
    var content;
    if (this.props.loadingLines) {
      content = <Loading msg="Loading Lines" />
    } else if (this.props.loadingStations) {
      content = <Loading msg="Loading Stations" />
    } else if (this.props.loadingStation) {
      content = <Loading msg="Loading Station" />
    } else if (this.props.currentLine == null) {
      content = <LineList lines={this.props.lines} />;
    } else if (this.props.currentStation != null) {
      content = (
        <div>
          <div className="row split">
            <button onClick={backToLine}><Icon icon="chevron-left" /></button>
            <button onClick={this.refreshStation}><Icon icon="reload" /></button>
          </div>
          <Station station={this.props.currentStation} />
        </div>
      );
    } else {
      content = (
        <div>
          <div className="row split">
            <button onClick={backToLines}><Icon icon="chevron-left" /></button>
          </div>
          <SimpleStationList stations={this.props.stations} line={this.props.currentLine} />
        </div>
      );
    }
    return (
      <div className="lines">
        {content}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PureLines);
