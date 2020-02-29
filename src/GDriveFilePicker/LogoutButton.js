import React from "react";
import { Button } from "semantic-ui-react";

const warningMsg = "Are you sure you want to disconnect from Google Drive?";

export default function LogoutButton() {
  function onBtnPress() {
    if (window.confirm(warningMsg)) {
      window.gapi.auth2.getAuthInstance().signOut();
    }
  }
  return (
    <Button secondary onClick={onBtnPress}>
      Disconnect
    </Button>
  );
}