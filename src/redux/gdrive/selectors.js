export function isInitialized(state) {
  return !!state.gdrive.isInitialized;
}

export function isLoggedIn(state) {
  return !!state.gdrive.isLoggedIn;
};

export function getFile(state) {
  return state.gdrive.file;
};

export function isFileSelected(state) {
  return !!getFile(state);
};