import { RESET, ADD } from "./actions";

const initialState = [];

export default function txReducer(state = initialState, action) {
  switch(action.type) {
    case RESET:
      return initialState;
    case ADD:
      return [...state, action.payload];
    default:
      return state;
  }
}
