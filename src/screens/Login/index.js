import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import DropboxFilePicker from 'react-dropbox-filepicker';
import { selectors, actions } from '../../redux/dropbox';
import { DROPBOX_APP_KEY } from '../../constants';
import localStorage from '../../localStorage';

const { getAccessToken, getFilePath } = selectors;
const { login, logout, selectFile } = actions;

function Login({
  accessToken,
  filepath,
  onLogin,
  onLogout,
  onFilePick,
  onError
}) {
  return (
    <div>
      <Header size="small">Dropbox</Header>
      <DropboxFilePicker
        appKey={DROPBOX_APP_KEY}
        accessToken={accessToken}
        filepath={filepath}
        onLogin={onLogin}
        onLogout={onLogout}
        onFilePick={onFilePick}
        onError={onError}
      />
    </div>
  );
}

const mapStateToProps = state => ({
  accessToken: getAccessToken(state),
  filepath: getFilePath(state)
});

const mapDispatchToProps = dispatch => ({
  onLogin: accessToken => {
    localStorage.setDropboxToken(accessToken);
    dispatch(login(accessToken));
  },
  onLogout: () => {
    localStorage.clear();
    dispatch(logout())
  },
  onFilePick: filepath => {
    localStorage.setDropboxFilepath(filepath);
    dispatch(selectFile(filepath));
  },
  onError: err => window.alert(err.msg)
});

Login.defaultProps = {
  accessToken: null,
  filepath: null
};

Login.propTypes = {
  // redux props
  accessToken: PropTypes.string,
  filepath: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onFilePick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
