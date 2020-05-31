import { transactions as transactionsSlice } from 'izreducer';
import { actions as errActions } from '../errors';
import getLocalDB from '../../LocalDB/get';
import { PAGE_SIZE } from '../../constants';

// --- action types --- //
export const RESET = 'transactions/reset';
export const ADD = 'transactions/add';

// --- action creators --- //
export function reset() {
  return { type: RESET };
}

export function add(tx) {
  return { type: ADD, payload: tx };
}

// --- thunk creators --- //

// load reads transactions from indexedDB into Redux store
export function load() {
  return async function(dispatch) {
    try {
      dispatch(reset());
      const localDB = await getLocalDB();
      async function readTransactions({ from }) {
        const actions = await localDB.getTransactions({ from, count: PAGE_SIZE });
        if (!actions.length) {
          return; // done
        }
        dispatch(add(actions));
        const lastAction = actions[actions.length - 1];
        return readTransactions({ from: lastAction.id });
      }
      await readTransactions({ from: "" });
    }
    catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed loading transactions from database."));
    }
  }
}

// put creates a new transaction, and saves it to indexedDB
export function put(data) {
  return async function putThunk(dispatch, getState) {
    try {
      const action = transactionsSlice.actions.put(data);
      const localDB = await getLocalDB();
      await localDB.processActions([action]);
      dispatch(load()); // reload transactions store from indexedDB
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
