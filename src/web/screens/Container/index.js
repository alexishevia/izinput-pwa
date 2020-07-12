import React from "react";
import PropTypes from "prop-types";
import { Container as SemanticContainer } from "semantic-ui-react";
import MainMenu from "./MainMenu";
import Errors from "./Errors";

export default function Container(props) {
  const {
    children,
    location, // location prop comes from @reach/router
  } = props;
  return (
    <div>
      <MainMenu location={location} />
      <Errors />
      <SemanticContainer>{children}</SemanticContainer>
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};
