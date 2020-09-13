import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonButton } from "@ionic/react";
import ChangeFileButton from "./ChangeFileButton";
import LogoutButton from "./LogoutButton";

export default function FileSelected({
  file,
  openFilePicker,
  onLogout,
  runSync,
}) {
  return (
    <>
      <IonItem>
        <p>
          You are connected to Google Drive and syncing to file:
          <br />
          {file.name}
        </p>
      </IonItem>
      <LogoutButton onClick={onLogout} />
      <ChangeFileButton onClick={openFilePicker} />
      <IonButton onClick={runSync}>Run Sync</IonButton>
    </>
  );
}

FileSelected.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  openFilePicker: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  runSync: PropTypes.func.isRequired,
};
