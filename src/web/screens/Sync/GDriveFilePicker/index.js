import React from "react";
import PropTypes from "prop-types";
import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";
import FileSelected from "./FileSelected";
import FilePicker from "./FilePicker";

export default class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderFilePicker: false,
    };
  }

  render() {
    const {
      isLoggedIn,
      file,
      onFilePick,
      onLogin,
      onLogout,
      runSync,
    } = this.props;
    const { renderFilePicker } = this.state;

    const isFileSelected = !!file;
    const openFilePicker = () => this.setState({ renderFilePicker: true });
    const closeFilePicker = () => {
      this.setState({ renderFilePicker: false });
    };

    if (!isLoggedIn) {
      return <LoggedOut onLogin={onLogin} />;
    }

    if (renderFilePicker) {
      return (
        <FilePicker
          onFilePick={(path) => {
            closeFilePicker();
            onFilePick(path);
          }}
          onCancel={closeFilePicker}
        />
      );
    }

    if (isFileSelected) {
      return (
        <FileSelected
          file={file}
          openFilePicker={openFilePicker}
          onLogout={onLogout}
          runSync={runSync}
        />
      );
    }

    return <LoggedIn openFilePicker={openFilePicker} onLogout={onLogout} />;
  }
}

Root.defaultProps = {
  file: null,
};

Root.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
  onFilePick: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  runSync: PropTypes.func.isRequired,
};
