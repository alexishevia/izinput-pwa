import { SET } from "./actions";

const initialState = [];

export default function categoriesReducer(state = initialState, action) {
  switch (action.type) {
    case SET:
      return action.payload;
    default:
      return state;
  }
}
