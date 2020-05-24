import { transactions as transactionsSlice } from 'izreducer';
import { actions as errActions } from '../errors';
import { getLocalDb } from '../../indexedDB';
import Validation from '../../helpers/Validation';

const { TYPES, CASH_FLOW } = transactionsSlice;

// --- action types --- //
export const RESET = 'transactions/reset';
export const ADD = 'transactions/add';

// --- helper functions --- //

function isPutConflict(prevTx, newTx) {
  if (!prevTx || !prevTx.id) return false;
  return (
    prevTx.modifiedAt >= newTx.modifiedAt ||
    prevTx.deletedAt >= newTx.modifiedAt
  );
}

function validateTransaction(transaction) {
  new Validation(transaction, "id")
    .required()
    .string()
    .notEmpty();
  new Validation(transaction, "amount").required().number();
  new Validation(transaction, "category").string();
  new Validation(transaction, "description").string();
  new Validation(transaction, "type").required().oneOf(Object.values(TYPES));
  new Validation(transaction, "cashFlow")
    .required()
    .oneOf(Object.values(CASH_FLOW));
  new Validation(transaction, "transactionDate").required().dayString();
  new Validation(transaction, "modifiedAt").required().dateString();
  new Validation(transaction, "deletedAt").dateString();
}

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
      const db = await getLocalDb();
      const dbTx = db.transaction(["transactions"], "readonly");
      let cursor = await dbTx.store.openCursor();
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
  return async function(dispatch, getState) {
    try {
      const action = transactionsSlice.actions.put(data);
      const db = await getLocalDb();
      const dbTx = db.transaction(["localActions", "transactions", "categories"], "readwrite");

      // merge new data with previous data (if transaction already exists)
      const existingTransaction = (
        await dbTx.objectStore("transactions").get(action.payload.id)
      ) || {};
      if (isPutConflict(existingTransaction, action.payload)) {
        throw new Error("PUT conflict. Action will be ignored.");
      }
      const transaction = { ...existingTransaction, ...action.payload };
      delete transaction.deletedAt;

      validateTransaction(transaction);

      // create transaction in idb
      await dbTx.objectStore("transactions").put(transaction);

      // create category in idb if it does not exist yet
      if (action.payload.category) {
        await dbTx.objectStore("categories").put({ id: action.payload.category });
      }

      // save action to idb
      await dbTx.objectStore("localActions").put(action);

      // finalize idb transaction
      await dbTx.done;

      // reload transactions store from indexedDB
      dispatch(load());
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
