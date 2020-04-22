import { ADD, RESET } from "./actions";

const initialState = [];

export default function reducer(state = initialState, action) {
  switch(action.type) {
    case ADD:
      return [action.payload, ...state];
    case RESET:
      return initialState;
    default:
      return state;
  }
}
