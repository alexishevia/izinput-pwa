import React from "react";
import PropTypes from "prop-types";
import { Modal } from "semantic-ui-react";

function Error({ children }) {
  return <p>{children}</p>;
}

Error.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

function ErrorsModal({ errors = [], resetErrors }) {
  const isOpen = !!(errors && errors.length);
  return (
    <Modal open={isOpen} centered={false} onClose={resetErrors}>
      <Modal.Content>
        <Modal.Header>Error</Modal.Header>
        <Modal.Description>
          {errors.map((msg) => (
            <Error key={msg}>{msg}</Error>
          ))}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

ErrorsModal.propTypes = {
  // redux props
  resetErrors: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ErrorsModal;
