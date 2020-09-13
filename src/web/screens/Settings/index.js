import React from "react";
import PropTypes from "prop-types";
import DangerArea from "./DangerArea";
import Sync from "./Sync";

export default function Settings({ coreApp }) {
  return (
    <>
      <Sync coreApp={coreApp} />
      <DangerArea coreApp={coreApp} />
    </>
  );
}

Settings.propTypes = {
  coreApp: PropTypes.shape({}).isRequired,
};
