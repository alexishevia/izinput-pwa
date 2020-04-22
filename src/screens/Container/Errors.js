import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'semantic-ui-react';
import {
  selectors as errSelectors,
  actions as errActions,
} from '../../redux/errors'

function Error({ children }) {
  return <p>{children}</p>
}

function ErrorsModal({ errors = [], resetErrors}) {
  const isOpen = !!(errors && errors.length);
  return (
      <Modal open={isOpen} centered={false} onClose={resetErrors}>
        <Modal.Content>
          <Modal.Header>Error</Modal.Header>
          <Modal.Description>{ errors.map(msg => <Error key={msg}>{msg}</Error>) }</Modal.Description>
        </Modal.Content>
      </Modal>
  );
}


ErrorsModal.propTypes = {
  // redux props
  resetErrors: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  errors: errSelectors.all(state),
});

const mapDispatchToProps = dispatch => ({
  resetErrors: () => dispatch(errActions.reset()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorsModal);
