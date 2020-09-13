import React from "react";
import PropTypes from "prop-types";
import { IonButton } from "@ionic/react";

export default function FilePickButton({ onClick }) {
  return <IonButton onClick={onClick}>Select File</IonButton>;
}

FilePickButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
