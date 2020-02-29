import { INITIALIZED, LOGIN, LOGOUT, SELECT_FILE } from "./actions";

const initialState = {
  isInitialized: false,
  isLoggedIn: false,
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


