
function getDropboxToken() {
  return window.localStorage.getItem('dropboxToken');
}

function setDropboxToken(token) {
  return window.localStorage.setItem('dropboxToken', token);
}

function getDropboxFilepath() {
  return window.localStorage.getItem('dropboxFilepath');
}

function setDropboxFilepath(filepath) {
  return window.localStorage.setItem('dropboxFilepath', filepath);
}

function clear() {
  return window.localStorage.clear();
}

export default {
  getDropboxToken,
  setDropboxToken,
  getDropboxFilepath,
  setDropboxFilepath,
  clear,
}
