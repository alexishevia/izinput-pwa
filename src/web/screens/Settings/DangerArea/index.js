import React from "react";
import PropTypes from "prop-types";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import DeleteLocalDataButton from "./DeleteLocalDataButton";

export default function DangerArea({ coreApp }) {
  function handleDelete() {
    coreApp.deleteLocalData();
  }

  return (
    <IonCard style={{ marginTop: "2rem" }}>
      <IonCardHeader>
        <IonCardTitle color="danger">Danger Area</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        When you delete your local data, all Invoice Zero data will be removed
        from this device.
        <br />
        <br />
        If you don&apos;t have a backup synced to a different device, you will
        lose all your data.
        <br />
        <br />
        <DeleteLocalDataButton onClick={handleDelete} />
      </IonCardContent>
    </IonCard>
  );
}

DangerArea.propTypes = {
  coreApp: PropTypes.shape({
    deleteLocalData: PropTypes.func.isRequired,
  }).isRequired,
};
