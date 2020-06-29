import { TransactionsCreateAction } from "../actionCreators";
import { actions as localDBActions } from "../localDB";
import { actions as errActions } from "../errors";
import getLocalDB from "../../LocalDB/get";

// --- action types --- //
export const RESET = "transactions/reset";
export const ADD = "transactions/add";

// --- action creators --- //
export function reset() {
  return { type: RESET };
}

export function add(tx) {
  return { type: ADD, payload: tx };
}

// --- thunk creators --- //

// put creates a new transaction, and saves it to indexedDB
export function put(data) {
  return async function putThunk(dispatch) {
    try {
      const action = new TransactionsCreateAction(data);
      const localDB = await getLocalDB();
      await localDB.processActions([action]);
      dispatch(localDBActions.load());
    } catch (err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  };
}
