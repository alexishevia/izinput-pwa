import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useErrors from "../../hooks/useErrors";
import GDriveFilePicker from "./GDriveFilePicker";
import RunSync from "./RunSync";
import Errors from "../../Errors";

function Sync({ coreApp, setIsSyncRunning }) {
  const [errors, addError, dismissErrors] = useErrors([]);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isLoggedIn !== null) {
      return;
    }
    setIsLoggedIn(false);
    async function loadData() {
      try {
        const loggedIn = await coreApp.isGDriveLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch (err) {
        addError(err);
      }
    }
    loadData();
  }, [isLoggedIn, coreApp, addError]);

  useEffect(() => {
    if (file !== null) {
      return;
    }
    setFile(undefined);
    async function loadData() {
      try {
        const selectedFile = await coreApp.gDriveGetSelectedFile();
        setFile(selectedFile);
      } catch (err) {
        addError(err);
      }
    }
    loadData();
  }, [file, coreApp, addError]);

  async function onLogin() {
    try {
      await coreApp.gDriveLogin();
      setIsLoggedIn(true);
    } catch (err) {
      addError(err);
    }
  }

  async function onLogout() {
    try {
      await coreApp.gDriveLogout();
      setIsLoggedIn(false);
    } catch (err) {
      addError(err);
    }
  }

  async function onFilePick(selectedFile) {
    try {
      await coreApp.gDriveSelectFile(selectedFile);
      setFile(selectedFile);
    } catch (err) {
      addError(err);
    }
  }

  async function onRunSync() {
    try {
      setIsSyncRunning(true);
      await coreApp.runSync();
      setIsSyncRunning(false);
    } catch (err) {
      setIsSyncRunning(false);
      addError(err);
    }
  }

  return (
    <>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <GDriveFilePicker
        isLoggedIn={isLoggedIn || false}
        file={file}
        onLogin={onLogin}
        onLogout={onLogout}
        onFilePick={onFilePick}
      />
      <hr />
      <RunSync isFileSelected={!!file} onRunSync={onRunSync} />
    </>
  );
}

Sync.propTypes = {
  coreApp: PropTypes.shape({
    gDriveGetSelectedFile: PropTypes.func.isRequired,
    gDriveLogin: PropTypes.func.isRequired,
    gDriveLogout: PropTypes.func.isRequired,
    gDriveSelectFile: PropTypes.func.isRequired,
    isGDriveLoggedIn: PropTypes.func.isRequired,
    runSync: PropTypes.func.isRequired,
  }).isRequired,
  setIsSyncRunning: PropTypes.func.isRequired,
};

export default Sync;
