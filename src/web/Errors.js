import React, { useState, useEffect } from "react";
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

function Errors({ coreApp }) {
  const [errors, setErrors] = useState([]);

  function addError(err) {
    setErrors([...errors, err]);
  }

  function handleDismiss(evt) {
    if (evt) {
      evt.preventDefault();
    }
    setErrors([]);
  }

  useEffect(() => {
    coreApp.on(coreApp.ERROR_EVENT, addError);
    return () => {
      coreApp.off(coreApp.ERROR_EVENT, addError);
    };
  }, []);

  const msg = errors.length ? getErrorMsg(errors[errors.length - 1]) : "";

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
  coreApp: PropTypes.shape({
    ERROR_EVENT: PropTypes.string.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};

export default Errors;
