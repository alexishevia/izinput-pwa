import React from "react";
import PropTypes from "prop-types";
import FilePickButton from "./FilePickButton";
import LogoutButton from "./LogoutButton";

export default function LoggedIn({ openFilePicker, onLogout }) {
  return (
    <div>
      <p>
        You are connected to Google Drive, but you still need to select a file.
        <br />
        The file you select will be used to backup/sync your data.
      </p>
      <div
        style={{ flexDirection: "row", justifyContent: "center", padding: 10 }}
      >
        <FilePickButton onClick={openFilePicker} />
        <LogoutButton onClick={onLogout} />
      </div>
    </div>
  );
}

LoggedIn.propTypes = {
  openFilePicker: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
