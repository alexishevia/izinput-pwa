import { transactions as transactionsSlice } from 'izreducer';
import { actions as errActions } from '../errors';
import { getLocalDb } from '../../indexedDB';
import Validation from '../../helpers/Validation';

const { TYPES, CASH_FLOW } = transactionsSlice;

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

// --- thunk creators --- //

// put creates a new transaction, and saves it to indexedDB
export function put(data) {
  return async function(dispatch, getState) {
    try {
      const action = transactionsSlice.actions.put(data);
      const db = await getLocalDb();
      const dbTx = db.transaction(["localActions", "transactions"], "readwrite");
      const txStore = dbTx.objectStore("transactions");
      const actionsStore = dbTx.objectStore("localActions");

      const existingTransaction = (await txStore.get(action.payload.id)) || {}

      if (isPutConflict(existingTransaction, action.payload)) {
        throw new Error("PUT conflict. Action will be ignored.");
      }

      const transaction = { ...existingTransaction, ...action.payload };
      delete transaction.deletedAt;

      validateTransaction(transaction);

      await txStore.put(transaction);
      // TODO: create action.payload.category if it does not exist yet
      // see: https://github.com/alexishevia/izreducer/blob/master/src/categories/reducer.js#L28

      await actionsStore.put(action);
      dispatch(action);
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
