import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectors as gdriveSelectors } from '../../redux/gdrive';
import sync from '../../sync';

class FileSync extends React.Component {
  componentDidMount(){
    const { file } = this.props;
    sync({ file });
  }

  render() {
    return (
      <div>
        loading file...
      </div>
    );
  }
}

FileSync.propTypes = {
  // redux props
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
  }),
};

const mapStateToProps = state => ({
  file: gdriveSelectors.getFile(state),
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileSync);
