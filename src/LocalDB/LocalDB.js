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
  function getTransactions({ from = "", count }) {
    // the transactions store uses the transaction.id as the key.
    // To retrieve all transactions without duplicates, keep calling this
    // function using the last transaction.id as the `from` value.
    return db.getAll("transactions", IDBKeyRange.lowerBound(from, true), count);
  }

  function getActionsCount() {
    return db.get("meta", "actionsCount");
  }

  function getLastAction() {
    return db.get("meta", "lastAction");
  }

  async function getLocalActions({ from, to }) {
    // the localActions store uses an auto-increment key.
    // Because we're constantly deleting localActions, it is not easy to
    // determine what is the real key for the first localAction.
    //
    // To simplify code for consumers of this function, we compare `to` and
    // `from` against the order in which localActions show up when using the
    // default cursor (not against the actual key value)
    let result = [];
    let counter = 0;
    let cursor = await db.transaction('localActions').store.openCursor();
    while (cursor && counter <= to) {
      if (counter >= from) {
        result.push(cursor.value);
      }
      counter += 1;
      cursor = await cursor.continue();
    }
    return result;
  }

  async function deleteLocalActions({ from, to }) {
    // the localActions store uses an auto-increment key.
    // Because we're constantly deleting localActions, it is not easy to
    // determine what is the real key for the first localAction.
    //
    // To simplify code for consumers of this function, we compare `to` and
    // `from` against the order in which localActions show up when using the
    // default cursor (not against the actual key value)
    let keysToDelete = [];
    let counter = 0;
    let cursor = await db.transaction('localActions').store.openCursor();
    while (cursor && counter <= to) {
      if (counter >= from) {
        keysToDelete.push(cursor.key);
      }
      counter += 1;
      cursor = await cursor.continue();
    }
    switch(keysToDelete.length) {
      case 0:
        return;
      case 1:
        return db.delete('localActions', keysToDelete[0]);
      default:
        const firstKey = keysToDelete.shift();
        const lastKey = keysToDelete.pop();
        return db.delete('localActions', IDBKeyRange.bound(firstKey, lastKey));
    }
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
          await dbTx.objectStore("localActions").put(JSON.stringify(action));
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
    getLocalActions,
    getActionsCount,
    getLastAction,
    deleteLocalActions,
    processActions,
  };
}
