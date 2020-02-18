export function getAccessToken(state) {
  return state.dropbox.accessToken;
};

export function getFilePath(state) {
  return state.dropbox.filepath;
};

export function isLoggedIn(state) {
  return !!getAccessToken(state);
};

export function isFileSelected(state) {
  return !!getFilePath(state);
};

