import {
  reset as resetTransactions,
  add as addTransactions,
} from "../transactions/actions";
import { actions as errActions } from "../errors";
import { set as setCategories } from "../categories/actions";
import getLocalDB from "../../LocalDB/get";
import { PAGE_SIZE } from "../../constants";

// load reads transactions and categories from indexedDB into Redux store
export function load() {
  return async function (dispatch) {
    try {
      dispatch(resetTransactions());
      const localDB = await getLocalDB();

      // load transactions
      async function readTransactionsRecursive({ from } = {}) {
        const lowerBound = from || 0;
        const upperBound = lowerBound + PAGE_SIZE;
        const transactions = await localDB.getTransactions({
          from: lowerBound,
          to: upperBound,
        });
        if (!transactions.length) {
          return; // done
        }
        dispatch(addTransactions(transactions));
        return readTransactionsRecursive({ from: upperBound + 1 });
      }
      await readTransactionsRecursive();

      // load categories
      const categories = await localDB.getCategories();
      dispatch(setCategories(categories));
    } catch (err) {
      console.error(err);
      dispatch(errActions.add("Failed loading data from database."));
    }
  };
}
