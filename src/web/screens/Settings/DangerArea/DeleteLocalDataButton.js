import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonButton, IonAlert } from "@ionic/react";

const header = "Delete Local Data";
const message =
  "When you delete your local data, all Invoice Zero data will be removed from this device.\nAre you sure you want to delete local data?";

export default function ChangeFileButton({ onClick }) {
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
        Delete Local Data
      </IonButton>
    </>
  );
}

ChangeFileButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
