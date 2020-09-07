import React, { useEffect } from "react";
import PropTypes from "prop-types";
import useErrors from "../../hooks/useErrors";
import useAsyncState from "../../hooks/useAsyncState";
import GDriveFilePicker from "./GDriveFilePicker";
import RunSync from "./RunSync";
import Errors from "../../Errors";

function Sync({ coreApp }) {
  const [errors, addError, dismissErrors] = useErrors([]);

  const [isLoggedIn, reloadIsLoggedIn] = useAsyncState(
    false,
    function* loadIsLoggedIn() {
      try {
        yield coreApp.isGDriveLoggedIn();
      } catch (err) {
        addError(err);
      }
    }
  );

  const [file, reloadFile] = useAsyncState(null, function* loadFile() {
    try {
      yield coreApp.gDriveGetSelectedFile();
    } catch (err) {
      addError(err);
    }
  });

  function reloadData() {
    reloadIsLoggedIn();
    reloadFile();
  }

  useEffect(() => {
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => {
      coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    };
  }, []);

  async function onLogin() {
    try {
      await coreApp.gDriveLogin();
    } catch (err) {
      addError(err);
    }
  }

  async function onLogout() {
    try {
      await coreApp.gDriveLogout();
    } catch (err) {
      addError(err);
    }
  }

  async function onFilePick(selectedFile) {
    try {
      await coreApp.gDriveSelectFile(selectedFile);
    } catch (err) {
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
      <RunSync isFileSelected={!!file} coreApp={coreApp} />
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
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    CHANGE_EVENT: PropTypes.string.isRequired,
  }).isRequired,
};

export default Sync;
