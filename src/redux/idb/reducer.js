import { NEW_DB } from "./actions";

const initialState = {
  // localDb holds a connection to an indexedDB database (or null if no connection has been established)
  localDb: null,
}

export default function iDbReducer(state = initialState, action) {
  switch(action.type) {
    case NEW_DB:
      return { ...initialState, localDb: action.payload };
    default:
      return state;
  }
}
