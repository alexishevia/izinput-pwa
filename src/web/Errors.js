import React from "react";
import PropTypes from "prop-types";
import { IonToast } from "@ionic/react";

function Errors({ errors = [], removeError }) {
  if (!errors.length) {
    return null;
  }

  const msg = errors[errors.length - 1];

  return (
    <IonToast
      key={msg}
      isOpen
      message={msg}
      position="bottom"
      buttons={[{ text: "X", role: "cancel" }]}
      onDidDismiss={() => removeError(msg)}
    />
  );
}

Errors.propTypes = {
  removeError: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Errors;
