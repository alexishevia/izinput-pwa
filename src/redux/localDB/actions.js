import {
  reset as resetTransactions,
  add as addTransactions,
} from "../transactions/actions";
import { actions as errActions } from "../errors";
import { set as setCategories } from "../categories/actions";
import getLocalDB from "../../LocalDB/get";
import { PAGE_SIZE } from "../../constants";

async function readTransactionsRecursive({ localDB, dispatch, from }) {
  const lowerBound = from || 0;
  const upperBound = lowerBound + PAGE_SIZE;
  const transactions = await localDB.getTransactions({
    from: lowerBound,
    to: upperBound,
  });
  if (!transactions.length) {
    return Promise.resolve(); // done
  }
  dispatch(addTransactions(transactions));
  return readTransactionsRecursive({
    localDB,
    dispatch,
    from: upperBound + 1,
  });
}

// load reads transactions and categories from indexedDB into Redux store
export function load({ deleteOldDBs } = {}) {
  return async function reloadDBThunk(dispatch) {
    try {
      dispatch(resetTransactions());
      const localDB = await getLocalDB({ deleteOldDBs });

      // load transactions
      await readTransactionsRecursive({ localDB, dispatch });

      // load categories
      const categories = await localDB.getCategories();
      dispatch(setCategories(categories));
    } catch (err) {
      console.error(err);
      dispatch(errActions.add("Failed loading data from database."));
    }
  };
}

export default {};
