import React from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";

export default function LoggedOut({ onLogin }) {
  return (
    <div>
      <p>You can connect to Google Drive to backup/sync your data.</p>
      <div
        style={{ flexDirection: "row", justifyContent: "center", padding: 10 }}
      >
        <Button onClick={onLogin}>Connect to Google Drive</Button>
      </div>
    </div>
  );
}

LoggedOut.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
