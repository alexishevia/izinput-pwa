import React from "react";
import PropTypes from "prop-types";
import GDriveFilePicker from "./GDriveFilePicker";
import RunSync from "./RunSync";

function Login({
  isGDriveReady,
  isLoggedIn,
  file,
  onLogin,
  onLogout,
  onFilePick,
  onError,
}) {
  if (!isGDriveReady) {
    return <div>Connecting to Google Drive...</div>;
  }
  return (
    <div>
      <GDriveFilePicker
        isLoggedIn={isLoggedIn}
        file={file}
        onLogin={onLogin}
        onLogout={onLogout}
        onFilePick={onFilePick}
        onError={onError}
      />
      <hr />
      <RunSync />
    </div>
  );
}

Login.defaultProps = {
  file: null,
};

Login.propTypes = {
  // redux props
  isGDriveReady: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onFilePick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Login;
