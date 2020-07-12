import React from "react";
import PropTypes from "prop-types";
import ChangeFileButton from "./ChangeFileButton";
import LogoutButton from "./LogoutButton";

export default function FileSelected({ file, openFilePicker, onLogout }) {
  return (
    <div>
      <p>
        You are connected to Google Drive and syncing to file:
        <br />
        {file.name}
      </p>
      <div
        style={{ flexDirection: "row", justifyContent: "center", padding: 10 }}
      >
        <ChangeFileButton onClick={openFilePicker} />
        <LogoutButton onClick={onLogout} />
      </div>
    </div>
  );
}

FileSelected.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  openFilePicker: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
