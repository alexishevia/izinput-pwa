import React from "react";
import PropTypes from "prop-types";
import { IonPage, IonContent, IonLabel } from "@ionic/react";
import ModalToolbar from "../../ModalToolbar";

export default function NotFound({ onClose }) {
  return (
    <IonPage id="main-content">
      <ModalToolbar title="Not Found" onClose={onClose} />
      <IonContent className="ion-padding">
        <IonLabel>
          <h2>Error</h2>
          <p>Screen not found.</p>
        </IonLabel>
      </IonContent>
    </IonPage>
  );
}

NotFound.propTypes = {
  onClose: PropTypes.func.isRequired,
};
