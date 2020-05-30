import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from "semantic-ui-react";
import { selectors as gSelectors, actions as gActions } from '../../../redux/gdrive';

class RunSync extends React.Component {
  render() {
    const { isFileSelected, onRunSync } = this.props;

    if (!isFileSelected) {
      return null;
    }

    return (
      <Button primary onClick={onRunSync}>
        Run Sync
      </Button>
    );
  }
}

const mapStateToProps = state => ({
  isFileSelected: gSelectors.isFileSelected(state),
});

const mapDispatchToProps = dispatch => ({
  onRunSync: () => dispatch(gActions.sync())
});

RunSync.defaultProps = {
  isFileSelected: false,
};

RunSync.propTypes = {
  // redux props
  isFileSelected: PropTypes.bool,
  onRunSync: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RunSync);
