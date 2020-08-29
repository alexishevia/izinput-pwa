import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonButton, IonAlert } from "@ionic/react";

const header = "Disconnect";
const message = "Are you sure you want to disconnect from Google Drive?";

export default function LogoutButton({ onClick }) {
  const [isAlertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <IonAlert
        isOpen={isAlertOpen}
        onDidDismiss={() => setAlertOpen(false)}
        header={header}
        message={message}
        buttons={[
          { text: "Cancel", role: "cancel" },
          { text: header, handler: onClick },
        ]}
      />
      <IonButton color="danger" onClick={() => setAlertOpen(true)}>
        Disconnect
      </IonButton>
    </>
  );
}

LogoutButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
