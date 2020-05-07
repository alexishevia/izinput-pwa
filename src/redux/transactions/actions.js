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
      // TODO: validate transaction before writing it to db.
      // see: https://github.com/alexishevia/izreducer/blob/master/src/transactions/reducer.js#L49-L62
      await dbTx.objectStore("transactions").put(action.payload);
      await dbTx.objectStore("localActions").put(action);
      // TODO: create action.payload.category if it does not exist yet
      dispatch(action);
      return;
    } catch(err) {
      console.error(err);
      dispatch(errActions.add("Failed saving transaction to database."));
    }
  }
}
