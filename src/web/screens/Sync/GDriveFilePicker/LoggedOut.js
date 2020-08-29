import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonButton } from "@ionic/react";

export default function LoggedOut({ onLogin }) {
  return (
    <>
      <IonItem>
        <p>You can connect to Google Drive to backup/sync your data.</p>
      </IonItem>
      <IonButton onClick={onLogin}>Connect to Google Drive</IonButton>
    </>
  );
}

LoggedOut.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
