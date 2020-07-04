import { v4 as uuidv4 } from "uuid";
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

// create saves a new transaction to indexedDB
export function create(data) {
  return async function createThunk(dispatch) {
    try {
      const {
        amount,
        cashFlow,
        category,
        description,
        transactionDate,
        type,
      } = data;
      const action = new TransactionsCreateAction({
        amount,
        cashFlow,
        category,
        deleted: false,
        description,
        id: uuidv4(),
        modifiedAt: new Date().toISOString(),
        transactionDate,
        type,
      });
      const localDB = await getLocalDB();
      await localDB.processActions([action]);
      dispatch(localDBActions.load());
    } catch (err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  };
}
