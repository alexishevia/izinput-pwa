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
            renderFilePicker: false
        };
    }

    renderContent() {
        const {
            isLoggedIn,
            file,
            onFilePick,
            onError,
            onLogin,
            onLogout,
        } = this.props;
        const { renderFilePicker } = this.state;

        const isFileSelected = !!file;
        const openFilePicker = () => this.setState({ renderFilePicker: true });
        const closeFilePicker = () => this.setState({ renderFilePicker: false });

        if (!isLoggedIn) {
          return <LoggedOut onLogin={onLogin} />;
        }

        if (renderFilePicker) {
          return (
            <FilePicker
              onFilePick={path => {
                closeFilePicker();
                onFilePick(path);
              }}
              onError={onError}
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
            />
          );
        }

        return <LoggedIn openFilePicker={openFilePicker} onLogout={onLogout} />;
    }

    render() {
        return <div> { this.renderContent() } </div>;
    }
}

Root.defaultProps = {
    isLoggedIn: false,
    file: null,
    onError: () => false
};

Root.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
  onFilePick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
