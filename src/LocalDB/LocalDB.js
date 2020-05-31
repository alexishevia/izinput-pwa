import Validation from '../helpers/Validation';
import { transactions as transactionsSlice } from 'izreducer';

const { TYPES, CASH_FLOW } = transactionsSlice;

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

async function processTransactionsPutV1({ dbTx, payload }) {
  // merge new data with previous data (if transaction already exists)
  const existingTransaction = (
    await dbTx.objectStore("transactions").get(payload.id)
  ) || {};

  if (isPutConflict(existingTransaction, payload)) {
    console.warn("PUT conflict. Action will be ignored.");
  }

  const transaction = { ...existingTransaction, ...payload };
  delete transaction.deletedAt;

  validateTransaction(transaction);

  // create transaction in idb
  await dbTx.objectStore("transactions").put(transaction);

  // create category in idb if it does not exist yet
  if (payload.category) {
    await dbTx.objectStore("categories").put({ id: payload.category });
  }
}

export default function LocalDB(db) {
  function getTransactions({ from, count }) {
    return db.getAll("transactions", IDBKeyRange.lowerBound(from, true), count);
  }

  async function processActions(actions, { actionsAreRemote } = {}) {
    const dbTx = db.transaction(["localActions", "meta", "transactions", "categories"], "readwrite");

    try {
      for (const action of actions) {
        switch(action.type) {
          case 'transactions/putv1':
            await processTransactionsPutV1({ dbTx, payload: action.payload });
            break;
          default:
            throw new Error('Unknown action type:', action.type);
        }
        if (!actionsAreRemote) {
          await dbTx.objectStore("localActions").put(action);
        }
      }

      const lastAction = actions[actions.length - 1];
      if (lastAction) {
        await dbTx.objectStore("meta").put(JSON.stringify(lastAction), "lastAction");
      }

      const count = await dbTx.objectStore("meta").get("actionsCount")
      const newCount = (count || 0) + actions.length;
      await dbTx.objectStore("meta").put(newCount, "actionsCount");

      await dbTx.done;
    } catch(err) {
      await dbTx.abort();
      throw err;
    }
  }

  return {
    getTransactions,
    processActions,
  };
}
