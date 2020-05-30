import { transactions as transactionsSlice } from 'izreducer';
import { actions as errActions } from '../errors';
import getLocalDb from '../../LocalDb/get';

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

// load reads transactions from indexedDB
export function load() {
  return async function(dispatch) {
    try {
      dispatch(reset());
      const localDb = await getLocalDb();
      let cursor = await localDb.getTransactionsCursor();
      while (cursor) {
        dispatch(add(cursor.value));
        cursor = await cursor.continue();
      }
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
      const localDb = await getLocalDb();
      await localDb.processActions([action])
      dispatch(load()); // reload transactions store from indexedDB
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
