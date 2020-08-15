import React from "react";
import PropTypes from "prop-types";
import { Container as SemanticContainer } from "semantic-ui-react";
import MainMenu from "./MainMenu";
import Errors from "./Errors";

export default function Container(props) {
  const {
    children,
    errors,
    location, // location prop comes from @reach/router
    resetErrors,
    isSyncRunning,
  } = props;
  return (
    <div>
      <MainMenu location={location} />
      {isSyncRunning ? (
        <div style={{ backgroundColor: "#eee", marginBottom: "1em" }}>
          syncing...
        </div>
      ) : null}
      <Errors errors={errors} resetErrors={resetErrors} />
      <SemanticContainer>{children}</SemanticContainer>
    </div>
  );
}

Container.defaultProps = {
  location: { pathname: "" },
  isSyncRunning: false,
};

Container.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  isSyncRunning: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  resetErrors: PropTypes.func.isRequired,
};
