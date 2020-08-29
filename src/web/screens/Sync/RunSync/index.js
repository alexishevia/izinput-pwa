import React from "react";
import PropTypes from "prop-types";
import { IonButton } from "@ionic/react";

function RunSync({ isFileSelected, onRunSync }) {
  if (!isFileSelected) {
    return null;
  }

  return <IonButton onClick={onRunSync}>Run Sync</IonButton>;
}

RunSync.defaultProps = {
  isFileSelected: false,
};

RunSync.propTypes = {
  isFileSelected: PropTypes.bool,
  onRunSync: PropTypes.func.isRequired,
};

export default RunSync;
