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

const ERR_EXISTING_INCOME = 'A income with id: "<ID>" exists';
const ERR_NO_EXISTING_INCOME = 'No income with id: "<ID>" exists';
const ERR_INVALID_INCOME = "Invalid data for income: <ERR>";
const ERR_EXISTING_EXPENSE = 'A expense with id: "<ID>" exists';
const ERR_NO_EXISTING_EXPENSE = 'No expense with id: "<ID>" exists';
const ERR_INVALID_EXPENSE = "Invalid data for expense: <ERR>";
const ERR_EXISTING_TRANSFER = 'A transfer with id: "<ID>" exists';
const ERR_NO_EXISTING_TRANSFER = 'No transfer with id: "<ID>" exists';
const ERR_INVALID_TRANSFER = "Invalid data for transfer: <ERR>";
const ERR_EXISTING_ACCOUNT = 'An account with id: "<ID>" exists';
const ERR_NO_EXISTING_ACCOUNT = 'No account with id: "<ID>" exists';
const ERR_INVALID_ACCOUNT = "Invalid data for account: <ERR>";
const ERR_EXISTING_CATEGORY = 'A category with id: "<ID>" exists';
const ERR_NO_EXISTING_CATEGORY = 'No category with id: "<ID>" exists';
const ERR_INVALID_CATEGORY = "Invalid data for category: <ERR>";
const ERR_UPDATE_CONFLICT = "Update conflict";
const ERR_NO_DELETE_ALLOWED = "Delete is not allowed in this action";

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

function ErrExistingCategory(id) {
  return {
    name: ERR_EXISTING_CATEGORY,
    message: ERR_EXISTING_CATEGORY.replace("<ID>", id),
  };
}

function ErrNoExistingCategory(id) {
  return {
    name: ERR_NO_EXISTING_CATEGORY,
    message: ERR_NO_EXISTING_CATEGORY.replace("<ID>", id),
  };
}

function ErrExistingIncome(id) {
  return {
    name: ERR_EXISTING_INCOME,
    message: ERR_EXISTING_INCOME.replace("<ID>", id),
  };
}

function ErrNoExistingIncome(id) {
  return {
    name: ERR_NO_EXISTING_INCOME,
    message: ERR_NO_EXISTING_INCOME.replace("<ID>", id),
  };
}

function ErrExistingExpense(id) {
  return {
    name: ERR_EXISTING_EXPENSE,
    message: ERR_EXISTING_EXPENSE.replace("<ID>", id),
  };
}

function ErrNoExistingExpense(id) {
  return {
    name: ERR_NO_EXISTING_EXPENSE,
    message: ERR_NO_EXISTING_EXPENSE.replace("<ID>", id),
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

function ErrInvalidCategory(msg) {
  return {
    name: ERR_INVALID_CATEGORY,
    message: ERR_INVALID_CATEGORY.replace("<ERR>", msg),
  };
}

function ErrInvalidIncome(msg) {
  return {
    name: ERR_INVALID_INCOME,
    message: ERR_INVALID_INCOME.replace("<ERR>", msg),
  };
}

function ErrInvalidExpense(msg) {
  return {
    name: ERR_INVALID_EXPENSE,
    message: ERR_INVALID_EXPENSE.replace("<ERR>", msg),
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
    new Validation(account, "initialBalance").required().number();
    new Validation(account, "modifiedAt").required().UTCDateString();
  } catch (err) {
    throw new ErrInvalidAccount(err.message);
  }
}

function checkValidCategory(category) {
  try {
    new Validation(category, "id").required().string().notEmpty();
    new Validation(category, "name").required().string().notEmpty();
    new Validation(category, "modifiedAt").required().UTCDateString();
    new Validation(category, "deleted").required().boolean();
  } catch (err) {
    throw new ErrInvalidCategory(err.message);
  }
}

function checkValidIncome(income) {
  try {
    new Validation(income, "id").required().string().notEmpty();
    new Validation(income, "amount").required().number().biggerThan(0);
    new Validation(income, "accountID").required().string().notEmpty();
    new Validation(income, "categoryID").required().string().notEmpty();
    new Validation(income, "description").required().string();
    new Validation(income, "transactionDate").required().dayString();
    new Validation(income, "modifiedAt").required().UTCDateString();
    new Validation(income, "deleted").required().boolean();
  } catch (err) {
    throw new ErrInvalidIncome(err.message);
  }
}

function checkValidExpense(expense) {
  try {
    new Validation(expense, "id").required().string().notEmpty();
    new Validation(expense, "amount").required().number().biggerThan(0);
    new Validation(expense, "accountID").required().string().notEmpty();
    new Validation(expense, "categoryID").required().string().notEmpty();
    new Validation(expense, "description").required().string();
    new Validation(expense, "transactionDate").required().dayString();
    new Validation(expense, "modifiedAt").required().UTCDateString();
    new Validation(expense, "deleted").required().boolean();
  } catch (err) {
    throw new ErrInvalidExpense(err.message);
  }
}

function checkValidTransfer(transfer) {
  try {
    new Validation(transfer, "id").required().string().notEmpty();
    new Validation(transfer, "amount").required().number().biggerThan(0);
    new Validation(transfer, "fromID").required().string().notEmpty();
    new Validation(transfer, "toID").required().string().notEmpty();
    new Validation(transfer, "description").required().string();
    new Validation(transfer, "transactionDate").required().dayString();
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
  db.version(2).stores({
    localActions: "++", // primary key hidden and auto-incremented
    meta: "", // primary key hidden but not auto-incremented
    accounts: "id", // primary key: id
    categories: "id", // primary key: id
    incomes: "id,modifiedAt,transactionDate", // primary key: id, indexes: [modifiedAt,transactionDate]
    expenses: "id,modifiedAt,transactionDate", // primary key: id, indexes: [modifiedAt,transactionDate]
    transfers: "id,modifiedAt,transactionDate", // primary key: id, indexes: [modifiedAt,transactionDate]
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

  function getCategory(id) {
    return db.categories.get(id);
  }

  function getIncome(id) {
    return db.incomes.get(id);
  }

  function getExpense(id) {
    return db.expenses.get(id);
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

  function getExistingCategory(id) {
    return getCategory(id).then((category) => {
      if (!category) {
        throw new ErrNoExistingCategory(id);
      }
      return category;
    });
  }

  function getExistingIncome(id) {
    return getIncome(id).then((income) => {
      if (!income) {
        throw new ErrNoExistingIncome(id);
      }
      return income;
    });
  }

  function getExistingExpense(id) {
    return getExpense(id).then((expense) => {
      if (!expense) {
        throw new ErrNoExistingExpense(id);
      }
      return expense;
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

  function checkNoExistingCategory(id) {
    return getCategory(id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingCategory(id);
        }
      });
  }

  function checkNoExistingIncome(id) {
    return getIncome(id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingIncome(id);
        }
      });
  }

  function checkNoExistingExpense(id) {
    return getExpense(id)
      .then(Boolean)
      .then((exists) => {
        if (exists) {
          throw new ErrExistingExpense(id);
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

  function createCategory({ payload }) {
    return Promise.resolve()
      .then(() => checkValidCategory(payload))
      .then(() => checkNoDelete(payload))
      .then(() => checkNoExistingCategory(payload.id))
      .then(() => db.categories.add(payload))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_CATEGORY:
          case ERR_INVALID_CATEGORY:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createCategory will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateCategory({ payload }) {
    return Promise.resolve()
      .then(() => checkNoDelete(payload))
      .then(() => getExistingCategory(payload.id))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload, deleted: false }))
      .then((updated) => {
        checkValidCategory(updated);
        return updated;
      })
      .then((updated) => db.categories.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_CATEGORY:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_CATEGORY:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateCategory will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteCategory({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingCategory(id)
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => {
        checkValidCategory(updated);
        return updated;
      })
      .then((updated) => db.categories.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_CATEGORY:
          case ERR_UPDATE_CONFLICT:
          case ERR_NO_EXISTING_CATEGORY:
            console.warn(`${err.message}. deleteCategory will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function createIncome({ payload }) {
    return Promise.resolve()
      .then(() => checkValidIncome(payload))
      .then(() => checkNoDelete(payload))
      .then(() => getExistingAccount(payload.accountID))
      .then(() => getExistingCategory(payload.categoryID))
      .then(() => checkNoExistingIncome(payload.id))
      .then(() => db.incomes.add(payload))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_INCOME:
          case ERR_INVALID_INCOME:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_NO_EXISTING_CATEGORY:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createIncome will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateIncome({ payload }) {
    return Promise.resolve()
      .then(() => checkNoDelete(payload))
      .then(() => getExistingIncome(payload.id))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload, deleted: false }))
      .then((updated) => {
        checkValidIncome(updated);
        return updated;
      })
      .then((updated) =>
        getExistingAccount(updated.accountID).then(() => updated)
      )
      .then((updated) =>
        getExistingCategory(updated.categoryID).then(() => updated)
      )
      .then((updated) => db.incomes.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_INCOME:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_NO_EXISTING_CATEGORY:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_INCOME:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateIncome will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteIncome({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingIncome(id)
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => {
        checkValidIncome(updated);
        return updated;
      })
      .then((updated) => db.incomes.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_INCOME:
          case ERR_UPDATE_CONFLICT:
          case ERR_NO_EXISTING_INCOME:
            console.warn(`${err.message}. deleteIncome will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function createExpense({ payload }) {
    return Promise.resolve()
      .then(() => checkValidExpense(payload))
      .then(() => checkNoDelete(payload))
      .then(() => getExistingAccount(payload.accountID))
      .then(() => getExistingCategory(payload.categoryID))
      .then(() => checkNoExistingExpense(payload.id))
      .then(() => db.expenses.add(payload))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_EXISTING_EXPENSE:
          case ERR_INVALID_EXPENSE:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_NO_EXISTING_CATEGORY:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. createExpense will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function updateExpense({ payload }) {
    return Promise.resolve()
      .then(() => checkNoDelete(payload))
      .then(() => getExistingExpense(payload.id))
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, ...payload, deleted: false }))
      .then((updated) => {
        checkValidExpense(updated);
        return updated;
      })
      .then((updated) =>
        getExistingAccount(updated.accountID).then(() => updated)
      )
      .then((updated) =>
        getExistingCategory(updated.categoryID).then(() => updated)
      )
      .then((updated) => db.expenses.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_NO_EXISTING_EXPENSE:
          case ERR_NO_EXISTING_ACCOUNT:
          case ERR_NO_EXISTING_CATEGORY:
          case ERR_UPDATE_CONFLICT:
          case ERR_INVALID_EXPENSE:
          case ERR_NO_DELETE_ALLOWED:
            console.warn(`${err.message}. updateExpense will be ignored`);
            return false; // expected failure
          default:
            throw err; // unexpected failure
        }
      });
  }

  function deleteExpense({ payload }) {
    const { id, modifiedAt } = payload;
    return getExistingExpense(id)
      .then((existing) => {
        checkNoUpdateConflict(existing, payload);
        return existing;
      })
      .then((existing) => ({ ...existing, deleted: true, modifiedAt }))
      .then((updated) => {
        checkValidExpense(updated);
        return updated;
      })
      .then((updated) => db.expenses.put(updated))
      .then(() => true /* success */)
      .catch((err) => {
        switch (err.name) {
          case ERR_INVALID_EXPENSE:
          case ERR_UPDATE_CONFLICT:
          case ERR_NO_EXISTING_EXPENSE:
            console.warn(`${err.message}. deleteExpense will be ignored`);
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
      .then(() => getExistingAccount(payload.fromID))
      .then(() => getExistingAccount(payload.toID))
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
      .then((updated) => getExistingAccount(updated.fromID).then(() => updated))
      .then((updated) => getExistingAccount(updated.toID).then(() => updated))
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
  function getAccounts({ from, to }) {
    return db.accounts
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  function getInitialBalance({ id }) {
    return getExistingAccount(id).then((account) => account.initialBalance);
  }

  // `fromDate` and `toDate` are inclusive
  function getTotalWithdrawals({ id, fromDate, toDate }) {
    function getOutTransfersTotal() {
      let total = 0;
      let query = db.transfers.filter(
        (transfer) => !transfer.deleted && transfer.fromID === id
      );
      if (fromDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate >= fromDate
        );
      }
      if (toDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate <= fromDate
        );
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

    function getExpensesTotal() {
      let total = 0;
      let query = db.expenses.filter(
        (expense) => !expense.deleted && expense.accountID === id
      );
      if (fromDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate >= fromDate
        );
      }
      if (toDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate <= toDate
        );
      }
      return query
        .each((expense) => {
          const amount = parseFloat(expense.amount, 10);
          if (Number.isNaN(amount)) {
            const msg = `Expense with id: ${id} has non-numeric amount: ${expense.amount}`;
            throw new ErrInvalidTransfer(msg);
          }
          total += expense.amount;
        })
        .then(() => total);
    }

    return Promise.all([getOutTransfersTotal(), getExpensesTotal()]).then(
      ([outTransfers, expenses]) => outTransfers + expenses
    );
  }

  function getTotalDeposits({ id, fromDate, toDate }) {
    function getInTransfersTotal() {
      let total = 0;
      let query = db.transfers.filter(
        (transfer) => !transfer.deleted && transfer.toID === id
      );
      if (fromDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate >= fromDate
        );
      }
      if (toDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate <= fromDate
        );
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
    function getIncomesTotal() {
      let total = 0;
      let query = db.incomes.filter(
        (income) => !income.deleted && income.accountID === id
      );
      if (fromDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate >= fromDate
        );
      }
      if (toDate) {
        query = query.filter(
          ({ transactionDate }) => transactionDate <= fromDate
        );
      }
      return query
        .each((income) => {
          const amount = parseFloat(income.amount, 10);
          if (Number.isNaN(amount)) {
            const msg = `Income with id: ${id} has non-numeric amount: ${income.amount}`;
            throw new ErrInvalidTransfer(msg);
          }
          total += income.amount;
        })
        .then(() => total);
    }
    return Promise.all([getInTransfersTotal(), getIncomesTotal()]).then(
      ([inTransfers, incomes]) => inTransfers + incomes
    );
  }

  function getAccountBalance(id) {
    return Promise.all([
      getInitialBalance({ id }),
      getTotalDeposits({ id }),
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
  function getCategories({ from, to }) {
    return db.categories
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  // `from`, `fromDate`, `to`, and `toDate` are inclusive
  function getIncomes({
    fromDate,
    toDate,
    accountIDs,
    categoryIDs,
    orderBy,
    reverse,
    from,
    to,
  }) {
    let query = db.incomes;
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    query = query.filter((expense) => !expense.deleted);
    if (Array.isArray(accountIDs)) {
      query = query.filter(({ accountID }) => accountIDs.includes(accountID));
    }
    if (Array.isArray(categoryIDs)) {
      query = query.filter(({ categoryID }) =>
        categoryIDs.includes(categoryID)
      );
    }
    if (fromDate) {
      query = query.filter(
        ({ transactionDate }) => fromDate <= transactionDate
      );
    }
    if (toDate) {
      query = query.filter(({ transactionDate }) => transactionDate <= toDate);
    }
    if (reverse) {
      query = query.reverse();
    }
    return query
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  // `from`, `fromDate`, `to`, and `toDate` are inclusive
  function getExpenses({
    fromDate,
    toDate,
    accountIDs,
    categoryIDs,
    orderBy,
    reverse,
    from,
    to,
  }) {
    let query = db.expenses;
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    query = query.filter((expense) => !expense.deleted);
    if (Array.isArray(accountIDs)) {
      query = query.filter(({ accountID }) => accountIDs.includes(accountID));
    }
    if (Array.isArray(categoryIDs)) {
      query = query.filter(({ categoryID }) =>
        categoryIDs.includes(categoryID)
      );
    }
    if (fromDate) {
      query = query.filter(
        ({ transactionDate }) => fromDate <= transactionDate
      );
    }
    if (toDate) {
      query = query.filter(({ transactionDate }) => transactionDate <= toDate);
    }
    if (reverse) {
      query = query.reverse();
    }
    return query
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  // `from`, `fromDate`, `to`, and `toDate` are inclusive
  function getTransfers({
    fromDate,
    toDate,
    accountIDs,
    orderBy,
    reverse,
    from,
    to,
  }) {
    let query = db.transfers;
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    query = query.filter((transfer) => !transfer.deleted);
    if (Array.isArray(accountIDs)) {
      query = query.filter(
        ({ fromID, toID }) =>
          accountIDs.includes(fromID) && accountIDs.includes(toID)
      );
    }
    if (fromDate) {
      query = query.filter(
        ({ transactionDate }) => fromDate <= transactionDate
      );
    }
    if (toDate) {
      query = query.filter(({ transactionDate }) => transactionDate <= toDate);
    }
    if (reverse) {
      query = query.reverse();
    }
    return query
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
      [
        db.localActions,
        db.meta,
        db.accounts,
        db.categories,
        db.incomes,
        db.expenses,
        db.transfers,
      ],
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
                    case "categories/create":
                      return createCategory({ payload: action.payload });
                    case "categories/update":
                      return updateCategory({ payload: action.payload });
                    case "categories/delete":
                      return deleteCategory({ payload: action.payload });
                    case "incomes/create":
                      return createIncome({ payload: action.payload });
                    case "incomes/update":
                      return updateIncome({ payload: action.payload });
                    case "incomes/delete":
                      return deleteIncome({ payload: action.payload });
                    case "expenses/create":
                      return createExpense({ payload: action.payload });
                    case "expenses/update":
                      return updateExpense({ payload: action.payload });
                    case "expenses/delete":
                      return deleteExpense({ payload: action.payload });
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
    getAccount,
    getAccountBalance,
    getAccounts,
    getActionsCount,
    getCategories,
    getExpense,
    getIncome,
    getLastAction,
    getLocalActions,
    getExpenses,
    getIncomes,
    getTransfers,
    getTotalWithdrawals,
    getTransfer,
    name,
    processActions,
  };
}

export default {
  ByName,
};
