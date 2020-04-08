import { promisify } from 'util';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '../../constants';
import { isInitialized } from './selectors';

const STORAGE_KEY_SELECTED_FILE = 'gDriveSelectedFile';

// --- action types --- //
export const INITIALIZED = 'gdrive/initialized';
export const LOGIN = 'gdrive/login';
export const LOGOUT = 'gdrive/logout';
export const SELECT_FILE = 'gdrive/selectFile';

// --- action creators --- //

function onLoginStatusChange(dispatch, isSignedIn) {
  if (isSignedIn) {
    return dispatch({ type: LOGIN });
  }
  return dispatch({ type: LOGOUT });
}

export function init() {
  return async function initThunk(dispatch, getState) {
    if (isInitialized(getState())) {
      // nothing to do. client is already initialized
      return;
    }

    try {
      // load client
      await promisify(window.gapi.load)('client:auth2');

      // init client
      await window.gapi.client.init({
        apikey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
        ],
        scope: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' ')
      })

      // add listener for login status
      const onLoginChange = onLoginStatusChange.bind(null, dispatch);
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(onLoginChange);

      // get initial login status
      onLoginChange(window.gapi.auth2.getAuthInstance().isSignedIn.get());

      // get selectedFile from localStorage
      const selectedFile = localStorage.getItem(STORAGE_KEY_SELECTED_FILE);
      if (selectedFile) {
        try {
          dispatch(selectFile(JSON.parse(selectedFile)));
        } catch (err) {
          console.error(
            `Error trying to parse selectedFile from localStorage: "${selectedFile}"
            ${err.message}`
          );
        }
      }

      // done
      dispatch({ type: INITIALIZED });
    } catch (err) {
      console.error('Error trying to initialize gdrive client', err);
    }
  }
}

export function logout() {
  return async function(dispatch) {
    await window.gapi.auth2.getAuthInstance().signOut();
    localStorage.removeItem(STORAGE_KEY_SELECTED_FILE);
  }
}

export function login() {
  return async function(dispatch) {
    await window.gapi.auth2.getAuthInstance().signIn();
  }
}

export function selectFile(file) {
  localStorage.setItem(STORAGE_KEY_SELECTED_FILE, JSON.stringify(file))
  return { type: SELECT_FILE, payload: file};
}
