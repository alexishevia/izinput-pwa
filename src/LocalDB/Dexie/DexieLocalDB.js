/*
 * This is a LocalDB implementation backed up by Dexie - https://dexie.org
 */

import Dexie from "dexie";
import shimIndexedDb from "indexeddbshim";
import Validation from "../../helpers/Validation";

// fix to get Dexie working in environments with no indexedDB support
if (!window.indexedDB) {
  const shim = {};
  shimIndexedDb(shim, { checkOrigin: false });
  const { indexedDB, IDBKeyRange } = shim;
  Dexie.dependencies.indexedDB = indexedDB;
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

const ERR_NO_EXISTING_TRANSACTION = 'No transaction with id: "<ID>" exists';
const ERR_EXISTING_TRANSACTION = 'A transaction with id: "<ID>" exists';
const ERR_INVALID_TRANSACTION = "Invalid data for transaction: <ERR>";
const ERR_UPDATE_CONFLICT = "Update conflict";
const ERR_NO_DELETE_ALLOWED = "Delete is not allowed in this action";
const ERR_NO_EXISTING_CATEGORY = 'No category with id: "<ID>" exists';
const ERR_INVALID_CATEGORY = "Invalid data for category: <ERR>";
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

function ErrNoExistingCategory(id) {
  return {
    name: ERR_NO_EXISTING_CATEGORY,
    message: ERR_NO_EXISTING_CATEGORY.replace("<ID>", id),
  };
}

function ErrInvalidCategory(msg) {
  return {
    name: ERR_INVALID_CATEGORY,
    message: ERR_INVALID_CATEGORY.replace("<ERR>", msg),
  };
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

function checkValidCategory(id) {
  try {
    new Validation({ id }, "id").required().string().notEmpty();
  } catch (err) {
    throw new ErrInvalidCategory(err.message);
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
    localActions: "++", // primary key hidden and auto-incremented
    meta: "", // primary key hidden but not auto-incremented
    transactions: "id", // primary key: id
    categories: "id", // primary key: id
  });

  function deleteDB() {
    return db.delete();
  }

  function getActionsCount() {
    return db.meta.get("actionsCount").then((count) => {
      const asNum = Number.parseInt(count, 10);
      return Number.isNaN(asNum) ? 0 : asNum;
    });
  }

  function getLastAction() {
    return db.meta.get("lastAction");
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

  function getCategory(id) {
    return db.categories.get(id);
  }

  function getExistingCategory(id) {
    return getCategory(id).then((category) => {
      if (!category) {
        throw new ErrNoExistingCategory(id);
      }
      return category;
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

  function createCategory(id) {
    return Promise.resolve()
      .then(() => checkValidCategory(id))
      .then(() => db.categories.put({ id }))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_CATEGORY:
            console.warn(`${err.message}. createCategory will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateTransactionCategories({ from, to }) {
    db.transactions
      .filter(({ category }) => category === from)
      .modify({ category: to });
  }

  function updateCategory({ payload }) {
    const { from, to } = payload;
    return Promise.resolve()
      .then(() => checkValidCategory(to))
      .then(() => {
        if (from === "") {
          return null;
        }
        return getExistingCategory(from).then(() => db.categories.delete(from));
      })
      .then(() => createCategory(to))
      .then(() => updateTransactionCategories({ from, to }))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_CATEGORY:
          case ERR_NO_EXISTING_CATEGORY:
            console.warn(`${err.message}. updateCategory will be ignored`);
            return; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteCategory(id) {
    return getExistingCategory(id)
      .then(() => db.categories.delete(id))
      .then(() => updateTransactionCategories({ from: id, to: "" }))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_CATEGORY:
            console.warn(`${err.message}. deleteCategory will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
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
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_TRANSACTION:
          case ERR_INVALID_TRANSACTION:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createTransaction will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
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
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_TRANSACTION:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_TRANSACTION:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateTransaction will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteTransaction({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingTransaction({ id })
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => {
        checkValidTransaction(updated);
        return updated;
      })
      .then((updated) => db.transactions.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_TRANSACTION:
          case ERR_UPDATE_CONFLICT:
          case ERR_NO_EXISTING_TRANSACTION:
            console.warn(`${err.message}. deleteTransaction will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  // both `from` and `to` are inclusive
  function getTransactions({ from, to }) {
    return db.transactions
      .filter(({ deleted }) => deleted === false)
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  function getCategories() {
    return db.categories
      .toArray()
      .then((categories) => categories.map((cat) => cat.id));
  }

  function updateInitialSavings(amount) {
    return db.meta.put(amount, "initialSavings").then(() => true /* success */);
  }

  function getInitialSavings() {
    return db.meta
      .get("initialSavings")
      .then(Number.parseFloat)
      .then((savings) => {
        return Number.isNaN(savings) ? 0 : savings;
      });
  }

  // both `from` and `to` are inclusive
  function getLocalActions({ from, to }) {
    return db.localActions
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  function deleteLocalActions({ from, to }) {
    return db.localActions
      .offset(from)
      .limit(to - from)
      .delete();
  }

  // if `actionsAreRemote` is true:
  // actions will be processed but not added to `localActions`
  function processActions(actions, { actionsAreRemote } = {}) {
    return db.transaction(
      "rw",
      [db.localActions, db.meta, db.transactions, db.categories],
      () =>
        getActionsCount().then((initialActionsCount) => {
          let actionsCount = initialActionsCount;
          return actions.reduce(
            (prevStep, action) =>
              prevStep
                .then(() => {
                  if (action.version !== 1) {
                    throw new Error(
                      `Unknown action.version: ${action.version}`
                    );
                  }
                  switch (action.type) {
                    case "transactions/create":
                      return createTransaction({ payload: action.payload });
                    case "transactions/update":
                      return updateTransaction({ payload: action.payload });
                    case "transactions/delete":
                      return deleteTransaction({ payload: action.payload });
                    case "categories/create":
                      return createCategory(action.payload);
                    case "categories/update":
                      return updateCategory({ payload: action.payload });
                    case "categories/delete":
                      return deleteCategory(action.payload);
                    case "initialSavings/update":
                      return updateInitialSavings(action.payload);
                    default:
                      throw new Error(`Unknown action type: ${action.type}`);
                  }
                })
                .then((success) => {
                  if (!success) {
                    return Promise.resolve();
                  }
                  const actionStr = JSON.stringify(action);
                  return Promise.all(
                    [
                      function updateLocalActions() {
                        if (actionsAreRemote) {
                          // no need to update localActions when processing "remote" actions
                          return Promise.resolve();
                        }
                        return db.localActions.put(actionStr);
                      },
                      function updateLastAction() {
                        return db.meta.put(actionStr, "lastAction");
                      },
                      function updateActionsCount() {
                        actionsCount += 1;
                        return db.meta.put(actionsCount, "actionsCount");
                      },
                    ].map((func) => func())
                  );
                }),
            Promise.resolve()
          );
        })
    );
  }

  return {
    name,
    deleteDB,
    deleteLocalActions,
    getActionsCount,
    getCategories,
    getInitialSavings,
    getLastAction,
    getLocalActions,
    getTransactions,
    processActions,
  };
}

export default {
  ByName,
};
