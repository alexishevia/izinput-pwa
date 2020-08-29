import React from "react";
import PropTypes from "prop-types";
import { IonItem } from "@ionic/react";
import ChangeFileButton from "./ChangeFileButton";
import LogoutButton from "./LogoutButton";

export default function FileSelected({ file, openFilePicker, onLogout }) {
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
    </>
  );
}

FileSelected.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  openFilePicker: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
