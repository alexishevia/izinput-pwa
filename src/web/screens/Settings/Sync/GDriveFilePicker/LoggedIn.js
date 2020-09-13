import React from "react";
import PropTypes from "prop-types";
import { IonItem } from "@ionic/react";
import FilePickButton from "./FilePickButton";
import LogoutButton from "./LogoutButton";

export default function LoggedIn({ openFilePicker, onLogout }) {
  return (
    <>
      <IonItem>
        <p>
          You are connected to Google Drive, but you still need to select a
          file.
          <br />
          The file you select will be used to backup/sync your data.
        </p>
      </IonItem>
      <LogoutButton onClick={onLogout} />
      <FilePickButton onClick={openFilePicker} />
    </>
  );
}

LoggedIn.propTypes = {
  openFilePicker: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
