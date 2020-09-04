import React from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonTitle,
} from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";

export default function ModalToolbar({ title, onClose, endButton, color }) {
  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  return (
    <IonToolbar color={color}>
      <IonButtons slot="start">
        <IonButton routerDirection="back" onClick={handleCancel}>
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
      </IonButtons>
      <IonTitle>{title}</IonTitle>
      {endButton ? <IonButtons slot="end">{endButton}</IonButtons> : null}
    </IonToolbar>
  );
}

ModalToolbar.defaultProps = {
  color: "primary",
  endButton: null,
};

ModalToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string,
  endButton: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onClose: PropTypes.func.isRequired,
};
