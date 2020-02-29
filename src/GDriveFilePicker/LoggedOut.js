import React from "react";
import { Button } from "semantic-ui-react";

function onClick() {
  window.gapi.auth2.getAuthInstance().signIn();
}

function LoginButton() {
  return <Button onClick={onClick}>Connect to Google Drive</Button>;
}

export default function LoggedOut() {
  return (
    <div>
      <p>You can connect to Google Drive to backup/sync your data.</p>
      <div
        style={{ flexDirection: "row", justifyContent: "center", padding: 10 }}
      >
        <LoginButton />
      </div>
    </div>
  );
}