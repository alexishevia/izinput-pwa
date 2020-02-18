import { LOGIN, LOGOUT, SELECT_FILE } from "./actions";

const initialState = {
  accessToken: null,
  filepath: null,
};

export default function dropboxReducer(state = initialState, action) {
  switch(action.type) {
    case LOGIN:
      return { ...state, accessToken: action.payload };
    case LOGOUT:
      return initialState;
    case SELECT_FILE:
      return { ...state, filepath: action.payload };
    default:
      return state;
  }
};

