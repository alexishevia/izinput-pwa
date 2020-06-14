/*
 * This is a LocalDB implementation backed up by Dexie - https://dexie.org
 */

import Dexie from "dexie";
import shimIndexedDb from "indexeddbshim";
import Validation from "../helpers/Validation";

// fix to get Dexie working in environments with no indexedDB support
const shim = {};
shimIndexedDb(shim, { checkOrigin: false });
const { indexedDB, IDBKeyRange } = shim;
Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

const ERR_NO_EXISTING_TRANSACTION = 'No transaction with id: "<ID>" exists';
const ERR_EXISTING_TRANSACTION = 'A transaction with id: "<ID>" exists';
const ERR_INVALID_TRANSACTION = "Invalid data for transaction: <ERR>";
const ERR_UPDATE_CONFLICT = "Update conflict";
const ERR_NO_DELETE_ALLOWED = "Delete is not allowed in this action";
const TRANSACTION_TYPES = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  TRANSFER: "TRANSFER",
};
const TRANSACTION_CASH_FLOW = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
};

function ErrNoDeleteAllowed() {
  return { name: ERR_NO_DELETE_ALLOWED, message: ERR_NO_DELETE_ALLOWED };
}

function ErrExistingTransaction(id) {
  return {
    name: ERR_EXISTING_TRANSACTION,
    message: ERR_EXISTING_TRANSACTION.replace("<ID>", id),
  };
}

function ErrNoExistingTransaction(id) {
  return {
    name: ERR_NO_EXISTING_TRANSACTION,
    message: ERR_NO_EXISTING_TRANSACTION.replace("<ID>", id),
  };
}

function ErrInvalidTransaction(msg) {
  return {
    name: ERR_INVALID_TRANSACTION,
    message: ERR_INVALID_TRANSACTION.replace("<ERR>", msg),
  };
}

function ErrUpdateConflict() {
  return { name: ERR_UPDATE_CONFLICT, message: ERR_UPDATE_CONFLICT };
}

function checkValidTransaction(transaction) {
  try {
    new Validation(transaction, "id").required().string().notEmpty();
    new Validation(transaction, "amount").required().number().biggerThan(0);
    new Validation(transaction, "type")
      .required()
      .oneOf(Object.values(TRANSACTION_TYPES));
    new Validation(transaction, "cashFlow")
      .required()
      .oneOf(Object.values(TRANSACTION_CASH_FLOW));
    new Validation(transaction, "category").required().string();
    new Validation(transaction, "description").required().string();
    new Validation(transaction, "transactionDate").required().dayString();
    new Validation(transaction, "modifiedAt").required().UTCDateString();
    new Validation(transaction, "deleted").required().boolean();
  } catch (err) {
    throw new ErrInvalidTransaction(err.message);
  }
}

function checkNoUpdateConflict(prevTx, newTx) {
  if (!newTx.modifiedAt || newTx.modifiedAt <= prevTx.modifiedAt) {
    throw new ErrUpdateConflict();
  }
}

// ByName returns a new LocalDB instance, backed by a Dexie db with name: `$name`.
function ByName(name) {
  const db = new Dexie(name);

  // run migrations
  db.version(1).stores({
    localActions: "++", // primary key hiddend and auto-incremented
    meta: "", // primary key hidden but not auto-incremented
    transactions: "id", // primary key: id
    categories: "id", // primary key: id
  });

  function deleteDB() {
    return db.delete();
  }

  function createCategory(id) {
    return db.categories.put({ id });
  }

  function getTransaction(id) {
    return db.transactions.get(id);
  }

  function getExistingTransaction(payload) {
    return getTransaction(payload.id).then((transaction) => {
      if (!transaction) {
        throw new ErrNoExistingTransaction(payload.id);
      }
      return transaction;
    });
  }

  function checkNoDelete(payload) {
    if (payload.deleted === true) {
      throw new ErrNoDeleteAllowed();
    }
  }

  function checkNoExistingTransaction(payload) {
    return getTransaction(payload.id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingTransaction(payload.id);
        }
      });
  }

  function createTransaction({ payload }) {
    return Promise.resolve()
      .then(() => checkValidTransaction(payload))
      .then(() => checkNoDelete(payload))
      .then(() => checkNoExistingTransaction(payload))
      .then(() => db.transactions.add(payload))
      .then(() => (payload.category ? createCategory(payload.category) : null))
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_TRANSACTION:
          case ERR_INVALID_TRANSACTION:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createTransaction will be ignored`);
            return;
          default:
            throw err;
        }
      });
  }

  function updateTransaction({ payload }) {
    return Promise.resolve()
      .then(() => checkNoDelete(payload))
      .then(() => getExistingTransaction(payload))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload, deleted: false }))
      .then((updated) => {
        checkValidTransaction(updated);
        return updated;
      })
      .then((updated) => db.transactions.put(updated))
      .then(() => (payload.category ? createCategory(payload.category) : null))
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_TRANSACTION:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_TRANSACTION:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateTransaction will be ignored`);
            return;
          default:
            throw err;
        }
      });
  }

  function deleteTransaction({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingTransaction({ id })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => db.transactions.put(updated))
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_TRANSACTION:
            console.warn(`${err.message}. deleteTransaction will be ignored`);
            return;
          default:
            throw err;
        }
      });
  }

  function getTransactions({ from = 0, limit = 50 } = {}) {
    return db.transactions.offset(from).limit(limit).toArray();
  }

  function getCategories() {
    return db.categories
      .toArray()
      .then((categories) => categories.map((cat) => cat.id));
  }

  function processActions(actions) {
    return db.transaction(
      "rw",
      [db.localActions, db.meta, db.transactions, db.categories],
      () =>
        actions.reduce(
          (prevStep, action) =>
            prevStep.then(() => {
              if (action.version !== 1) {
                throw new Error(`Unknown action.version: ${action.version}`);
              }
              switch (action.type) {
                case "transactions/create":
                  return createTransaction({ payload: action.payload });
                case "transactions/update":
                  return updateTransaction({ payload: action.payload });
                case "transactions/delete":
                  return deleteTransaction({ payload: action.payload });
                default:
                  throw new Error("Unknown action type:", action.type);
              }
            }),
          Promise.resolve()
        )
    );
  }

  return {
    deleteDB,
    getCategories,
    getTransactions,
    processActions,
  };
}

export default {
  ByName,
};
