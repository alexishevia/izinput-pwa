import React from "react";
import PropTypes from "prop-types";
import GDriveFilePicker from "./GDriveFilePicker";
import RunSync from "./RunSync";

function Sync({ isLoggedIn, file, onLogin, onLogout, onFilePick, onRunSync }) {
  return (
    <>
      <GDriveFilePicker
        isLoggedIn={isLoggedIn}
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

Sync.defaultProps = {
  file: null,
};

Sync.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onFilePick: PropTypes.func.isRequired,
  onRunSync: PropTypes.func.isRequired,
};

export default Sync;
