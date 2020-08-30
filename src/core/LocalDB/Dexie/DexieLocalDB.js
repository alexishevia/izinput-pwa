/*
 * This is a LocalDB implementation backed up by Dexie - https://dexie.org
 */

import Dexie from "dexie";
import shimIndexedDb from "indexeddbshim";
import Validation from "../../../helpers/Validation";

// fix to get Dexie working in environments with no indexedDB support
if (!window.indexedDB) {
  const shim = {};
  shimIndexedDb(shim, { checkOrigin: false });
  const { indexedDB, IDBKeyRange } = shim;
  Dexie.dependencies.indexedDB = indexedDB;
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

const ERR_EXISTING_TRANSFER = 'A transfer with id: "<ID>" exists';
const ERR_NO_EXISTING_TRANSFER = 'No transfer with id: "<ID>" exists';
const ERR_INVALID_TRANSFER = "Invalid data for transfer: <ERR>";
const ERR_EXISTING_ACCOUNT = 'An account with id: "<ID>" exists';
const ERR_NO_EXISTING_ACCOUNT = 'No account with id: "<ID>" exists';
const ERR_INVALID_ACCOUNT = "Invalid data for account: <ERR>";
const ERR_UPDATE_CONFLICT = "Update conflict";
const ERR_NO_DELETE_ALLOWED = "Delete is not allowed in this action";
const ACCOUNT_TYPES = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
};

function ErrNoDeleteAllowed() {
  return { name: ERR_NO_DELETE_ALLOWED, message: ERR_NO_DELETE_ALLOWED };
}

function ErrExistingAccount(id) {
  return {
    name: ERR_EXISTING_ACCOUNT,
    message: ERR_EXISTING_ACCOUNT.replace("<ID>", id),
  };
}

function ErrNoExistingAccount(id) {
  return {
    name: ERR_NO_EXISTING_ACCOUNT,
    message: ERR_NO_EXISTING_ACCOUNT.replace("<ID>", id),
  };
}

function ErrExistingTransfer(id) {
  return {
    name: ERR_EXISTING_TRANSFER,
    message: ERR_EXISTING_TRANSFER.replace("<ID>", id),
  };
}

function ErrNoExistingTransfer(id) {
  return {
    name: ERR_NO_EXISTING_TRANSFER,
    message: ERR_NO_EXISTING_TRANSFER.replace("<ID>", id),
  };
}

function ErrInvalidAccount(msg) {
  return {
    name: ERR_INVALID_ACCOUNT,
    message: ERR_INVALID_ACCOUNT.replace("<ERR>", msg),
  };
}

function ErrInvalidTransfer(msg) {
  return {
    name: ERR_INVALID_TRANSFER,
    message: ERR_INVALID_TRANSFER.replace("<ERR>", msg),
  };
}

function ErrUpdateConflict() {
  return { name: ERR_UPDATE_CONFLICT, message: ERR_UPDATE_CONFLICT };
}

function checkValidAccount(account) {
  try {
    new Validation(account, "id").required().string().notEmpty();
    new Validation(account, "name").required().string().notEmpty();
    new Validation(account, "type")
      .required()
      .oneOf(Object.values(ACCOUNT_TYPES));
    new Validation(account, "initialBalance").required().number();
    new Validation(account, "modifiedAt").required().UTCDateString();
    new Validation(account, "active").required().boolean();
  } catch (err) {
    throw new ErrInvalidAccount(err.message);
  }
}

function checkValidTransfer(transfer) {
  try {
    new Validation(transfer, "id").required().string().notEmpty();
    new Validation(transfer, "amount").required().number().biggerThan(0);
    new Validation(transfer, "from").required().string().notEmpty();
    new Validation(transfer, "to").required().string().notEmpty();
    new Validation(transfer, "description").required().string();
    new Validation(transfer, "transferDate").required().dayString();
    new Validation(transfer, "modifiedAt").required().UTCDateString();
    new Validation(transfer, "deleted").required().boolean();
  } catch (err) {
    throw new ErrInvalidTransfer(err.message);
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
    accounts: "id", // primary key: id
    transfers: "id", // primary key: id
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

  function getAccount(id) {
    return db.accounts.get(id);
  }

  function getTransfer(id) {
    return db.transfers.get(id);
  }

  function getExistingAccount(id) {
    return getAccount(id).then((account) => {
      if (!account) {
        throw new ErrNoExistingAccount(id);
      }
      return account;
    });
  }

  function getExistingTransfer(id) {
    return getTransfer(id).then((transfer) => {
      if (!transfer) {
        throw new ErrNoExistingTransfer(id);
      }
      return transfer;
    });
  }

  function checkNoDelete(payload) {
    if (payload.deleted === true) {
      throw new ErrNoDeleteAllowed();
    }
  }

  function checkNoExistingAccount(id) {
    return getAccount(id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingAccount(id);
        }
      });
  }

  function checkNoExistingTransfer(id) {
    return getTransfer(id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingTransfer(id);
        }
      });
  }

  function createAccount({ payload }) {
    return Promise.resolve()
      .then(() => checkValidAccount(payload))
      .then(() => checkNoExistingAccount(payload.id))
      .then(() => db.accounts.add(payload))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_ACCOUNT:
          case ERR_INVALID_ACCOUNT:
            console.warn(`${err.message}. createAccount will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateAccount({ payload }) {
    return Promise.resolve()
      .then(() => getExistingAccount(payload.id))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload }))
      .then((updated) => {
        checkValidAccount(updated);
        return updated;
      })
      .then((updated) => db.accounts.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_ACCOUNT:
            console.warn(`${err.message}. updateAccount will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function createTransfer({ payload }) {
    return Promise.resolve()
      .then(() => checkValidTransfer(payload))
      .then(() => checkNoDelete(payload))
      .then(() => getExistingAccount(payload.from))
      .then(() => getExistingAccount(payload.to))
      .then(() => checkNoExistingTransfer(payload.id))
      .then(() => db.transfers.add(payload))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_TRANSFER:
          case ERR_INVALID_TRANSFER:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createTransfer will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateTransfer({ payload }) {
    return Promise.resolve()
      .then(() => checkNoDelete(payload))
      .then(() => getExistingTransfer(payload.id))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload, deleted: false }))
      .then((updated) => {
        checkValidTransfer(updated);
        return updated;
      })
      .then((updated) => getExistingAccount(updated.from).then(() => updated))
      .then((updated) => getExistingAccount(updated.to).then(() => updated))
      .then((updated) => db.transfers.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_TRANSFER:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_TRANSFER:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateTransfer will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteTransfer({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingTransfer(id)
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => {
        checkValidTransfer(updated);
        return updated;
      })
      .then((updated) => db.transfers.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_TRANSFER:
          case ERR_UPDATE_CONFLICT:
          case ERR_NO_EXISTING_TRANSFER:
            console.warn(`${err.message}. deleteTransfer will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  // `from` and `to` are inclusive
  function getAccounts({ from, to, type }) {
    let query = db.accounts;
    if (type) {
      query = query.filter((acc) => acc.type === type);
    }
    return query
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  function getInitialBalance(id) {
    return getExistingAccount(id).then((account) => account.initialBalance);
  }

  // `fromDate` and `toDate` are inclusive
  function getTotalWithdrawals({ id, fromDate, toDate }) {
    let total = 0;
    const query = db.transfers.filter(
      (transfer) => !transfer.deleted && transfer.from === id
    );

    if (fromDate) {
      query.filter(({ transferDate }) => transferDate >= fromDate);
    }

    if (toDate) {
      query.filter(({ transferDate }) => transferDate <= fromDate);
    }

    return query
      .each((transfer) => {
        const amount = parseFloat(transfer.amount, 10);
        if (Number.isNaN(amount)) {
          const msg = `Transfer with id: ${id} has non-numeric amount: ${transfer.amount}`;
          throw new ErrInvalidTransfer(msg);
        }
        total += transfer.amount;
      })
      .then(() => total);
  }

  function getTotalDeposits(id) {
    let total = 0;
    return db.transfers
      .filter((transfer) => !transfer.deleted && transfer.to === id)
      .each((transfer) => {
        const amount = parseFloat(transfer.amount, 10);
        if (Number.isNaN(amount)) {
          const msg = `Transfer with id: ${id} has non-numeric amount: ${transfer.amount}`;
          throw new ErrInvalidTransfer(msg);
        }
        total += transfer.amount;
      })
      .then(() => total);
  }

  function getAccountBalance(id) {
    return Promise.all([
      getInitialBalance(id),
      getTotalDeposits(id),
      getTotalWithdrawals({ id }),
    ]).then(([initialBalance, deposits, withdrawals]) => {
      return initialBalance + deposits - withdrawals;
    });
  }

  // `from` and `to` are inclusive
  function getLocalActions({ from, to }) {
    return db.localActions
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  // `from` and `to` are inclusive
  function getTransfers({ from, to }) {
    return db.transfers
      .filter((transfer) => !transfer.deleted)
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  // `from` and `to` are inclusive
  function getRecentTransfers({ from, to }) {
    return db.transfers
      .reverse()
      .filter((transfer) => !transfer.deleted)
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
      [db.localActions, db.meta, db.accounts, db.transfers],
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
                    case "accounts/create":
                      return createAccount({ payload: action.payload });
                    case "accounts/update":
                      return updateAccount({ payload: action.payload });
                    case "transfers/create":
                      return createTransfer({ payload: action.payload });
                    case "transfers/update":
                      return updateTransfer({ payload: action.payload });
                    case "transfers/delete":
                      return deleteTransfer({ payload: action.payload });
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
    deleteDB,
    deleteLocalActions,
    getAccountBalance,
    getAccounts,
    getActionsCount,
    getLastAction,
    getLocalActions,
    getRecentTransfers,
    getTotalWithdrawals,
    getTransfers,
    name,
    processActions,
  };
}

export default {
  ByName,
};
