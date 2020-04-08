import React from "react";
import { Button } from "semantic-ui-react";

const warningMsg = "Are you sure you want to disconnect from Google Drive?";

export default function LogoutButton({ onClick }) {
  function onBtnPress() {
    if (window.confirm(warningMsg)) {
      onClick();
    }
  }
  return (
    <Button secondary onClick={onBtnPress}>
      Disconnect
    </Button>
  );
}
