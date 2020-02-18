export const LOGIN = 'dropbox/login';
export const LOGOUT = 'dropbox/logout';
export const SELECT_FILE = 'dropbox/selectFile';

export function login(accessToken) {
  return { type: LOGIN, payload: accessToken };
}

export function logout() {
  return { type: LOGOUT };
}

export function selectFile(filepath) {
  return { type: SELECT_FILE, payload: filepath };
}
