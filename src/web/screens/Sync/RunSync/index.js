import React from "react";
import PropTypes from "prop-types";
import { IonButton } from "@ionic/react";

function RunSync({ isFileSelected, coreApp }) {
  if (!isFileSelected) {
    return null;
  }

  function onRunSync(evt) {
    evt.preventDefault();
    coreApp.runSync();
  }

  return <IonButton onClick={onRunSync}>Run Sync</IonButton>;
}

RunSync.defaultProps = {
  isFileSelected: false,
};

RunSync.propTypes = {
  isFileSelected: PropTypes.bool,
  coreApp: PropTypes.shape({
    runSync: PropTypes.func.isRequired,
  }).isRequired,
};

export default RunSync;
