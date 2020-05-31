import { RESET, ADD } from "./actions";

const initialState = [];

export default function txReducer(state = initialState, action) {
  switch(action.type) {
    case RESET:
      return initialState;
    case ADD:
      let toAdd = Array.isArray(action.payload) ? action.payload : [action.payload];
      return [...state, ...toAdd];
    default:
      return state;
  }
}
