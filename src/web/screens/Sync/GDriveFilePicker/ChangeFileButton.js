import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonButton, IonAlert } from "@ionic/react";

const header = "Change File";
const message =
  "If you change the sync file, all local data will be merged with the new file.\n\nAre you sure you want to change the sync file?";

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
      <IonButton color="medium" onClick={() => setAlertOpen(true)}>
        Change File
      </IonButton>
    </>
  );
}

ChangeFileButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
