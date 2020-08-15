import React from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";

function RunSync({ isFileSelected, onRunSync }) {
  if (!isFileSelected) {
    return null;
  }

  return (
    <Button primary onClick={onRunSync}>
      Run Sync
    </Button>
  );
}

RunSync.defaultProps = {
  isFileSelected: false,
};

RunSync.propTypes = {
  isFileSelected: PropTypes.bool,
  onRunSync: PropTypes.func.isRequired,
};

export default RunSync;
