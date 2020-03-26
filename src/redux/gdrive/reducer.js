import { INITIALIZED, LOGIN, LOGOUT, SELECT_FILE } from "./actions";

const initialState = {
  // isInitialized is true when the gdrive client has finished initializing.
  // ie: when `window.gapi.client.init()` is done
  isInitialized: false,

  // isLoggedIn is true when the user is currently logged in to GDrive AND has
  // provided authorization for IZInput to access GDrive
  isLoggedIn: false,

  // once the user selects a GDrive file to sync with, the `file` value will be
  // an object with the GDrive file metadata. eg:
  // file: {
  //     fileType: "file",
  //     id: "1-Uf28d8yLuudFXxTUYu7-b7M95aSgrQZ0PKuhuxchqA",
  //     name: "test",
  //     mimeType: "application/vnd.google-apps.spreadsheet"
  // }
  file: null,
};

export default function gdriveReducer(state = initialState, action) {
  switch(action.type) {
    case INITIALIZED:
      return { ...state, isInitialized: true };
    case LOGIN:
      return { ...state, isLoggedIn: true };
    case LOGOUT:
      return { ...state, isLoggedIn: false, file: null };
    case SELECT_FILE:
      return { ...state, file: action.payload };
    default:
      return state;
  }
};


