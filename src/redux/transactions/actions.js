import { transactions as transactionsSlice } from 'izreducer';
import { actions as errActions } from '../errors';
import { getLocalDb } from '../../indexedDB';

// --- thunk creators --- //

// put creates a new transaction, and saves it to indexedDB
export function put(data) {
  return async function(dispatch, getState) {
    try {
      const action = transactionsSlice.actions.put(data);
      const db = await getLocalDb();
      const dbTx = db.transaction(["localActions", "transactions"], "readwrite");

      function onError(err) {
        console.error(err);
        dispatch(errActions.add("Failed saving transaction to database."));
      }

      function saveToLocalCommands(onSuccess) {
        const operation = dbTx.objectStore("localActions").put(action);
        operation.onerror = () => onError(operation.error);
        operation.onsuccess = onSuccess;
      }

      function saveToTransactions(onSuccess) {
        // TODO: validate transaction before writing it to db.
        // see: https://github.com/alexishevia/izreducer/blob/master/src/transactions/reducer.js#L49-L62
        const operation = dbTx.objectStore("transactions").put(action.payload);
        operation.onerror = () => onError(operation.error);
        operation.onsuccess = onSuccess;
      }

      // TODO: create action.payload.category if it does not exist yet

      // run operations
      return new Promise(resolve => {
        saveToLocalCommands(saveToTransactions.bind(null, resolve))
      })
      .then(() => dispatch(action))
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
