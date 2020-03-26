import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GDriveFilePicker from '../../GDriveFilePicker';
import { selectors as gdriveSelectors, actions } from '../../redux/gdrive';

const { login, logout, selectFile } = actions;

function Login({
  isGDriveReady,
  isLoggedIn,
  file,
  onLogin,
  onLogout,
  onFilePick,
  onError
}) {
  if (!isGDriveReady) {
    return <div>Connecting to Google Drive...</div>;
  }
  return (
    <div>
      <GDriveFilePicker
        isLoggedIn={isLoggedIn}
        file={file}
        onLogin={onLogin}
        onLogout={onLogout}
        onFilePick={onFilePick}
        onError={onError}
      />
    </div>
  );
}

const mapStateToProps = state => ({
  file: gdriveSelectors.getFile(state),
  isLoggedIn: gdriveSelectors.isLoggedIn(state),
  isGDriveReady: gdriveSelectors.isInitialized(state),
});

const mapDispatchToProps = dispatch => ({
  onLogin: accessToken => {
    dispatch(login(accessToken));
  },
  onLogout: () => {
    dispatch(logout())
  },
  onFilePick: file => {
    dispatch(selectFile(file));
  },
  onError: err => window.alert(err.msg)
});

Login.defaultProps = {
  accessToken: null,
  file: null
};

Login.propTypes = {
  // redux props
  accessToken: PropTypes.string,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onFilePick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
