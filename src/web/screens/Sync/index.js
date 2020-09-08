import React, { useEffect } from "react";
import PropTypes from "prop-types";
import useAsyncState from "../../hooks/useAsyncState";
import GDriveFilePicker from "./GDriveFilePicker";
import RunSync from "./RunSync";

function Sync({ coreApp }) {
  const [isLoggedIn, reloadIsLoggedIn] = useAsyncState(
    false,
    function* loadIsLoggedIn() {
      try {
        yield coreApp.isGDriveLoggedIn();
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  const [file, reloadFile] = useAsyncState(null, function* loadFile() {
    try {
      yield coreApp.gDriveGetSelectedFile();
    } catch (err) {
      coreApp.newError(err);
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
      coreApp.newError(err);
    }
  }

  async function onLogout() {
    try {
      await coreApp.gDriveLogout();
    } catch (err) {
      coreApp.newError(err);
    }
  }

  async function onFilePick(selectedFile) {
    try {
      await coreApp.gDriveSelectFile(selectedFile);
    } catch (err) {
      coreApp.newError(err);
    }
  }

  return (
    <>
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
    CHANGE_EVENT: PropTypes.string.isRequired,
    gDriveGetSelectedFile: PropTypes.func.isRequired,
    gDriveLogin: PropTypes.func.isRequired,
    gDriveLogout: PropTypes.func.isRequired,
    gDriveSelectFile: PropTypes.func.isRequired,
    isGDriveLoggedIn: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
    runSync: PropTypes.func.isRequired,
  }).isRequired,
};

export default Sync;
