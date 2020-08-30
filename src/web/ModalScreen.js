import React from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonTitle,
  IonContent,
  IonPage,
} from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";

export default function ModalPage({ title, children, onClose }) {
  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  return (
    <>
      <IonPage id="main-content">
        <IonToolbar color="secondary">
          <IonButtons slot="start">
            <IonButton routerDirection="back" onClick={handleCancel}>
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
        <IonContent>{children}</IonContent>
      </IonPage>
    </>
  );
}

ModalPage.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};
