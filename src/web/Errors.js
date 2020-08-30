import React from "react";
import PropTypes from "prop-types";
import { IonToast } from "@ionic/react";

function getErrorMsg(err) {
  if (typeof err === typeof "string") {
    return err;
  }
  if (err && err.message) {
    return err.message;
  }
  return "Unknown error";
}

function Errors({ errors = [], onDismiss }) {
  const msg = errors.length ? getErrorMsg(errors[errors.length - 1]) : "";

  function handleDismiss(evt) {
    if (evt) {
      evt.preventDefault();
    }
    onDismiss();
  }

  return (
    <IonToast
      key={msg}
      isOpen={!!msg}
      message={msg}
      position="bottom"
      buttons={[{ text: "X", role: "cancel", handler: handleDismiss }]}
    />
  );
}

Errors.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default Errors;
