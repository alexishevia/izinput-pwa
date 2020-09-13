/* eslint no-console:[0] */
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { EventEmitter } from "events";
import syncRecursive from "./sync/sync";
import getLocalDB from "./LocalDB/get";
import setLocalDB from "./LocalDB/set";
import getCloudReplica from "./CloudReplica/get";
import GoogleSpreadsheet from "./AppendOnlyLog/GoogleSpreadsheet";
import {
  AccountsCreateAction,
  AccountsUpdateAction,
  ExpensesCreateAction,
  ExpensesDeleteAction,
  ExpensesUpdateAction,
  IncomesCreateAction,
  IncomesDeleteAction,
  IncomesUpdateAction,
  TransfersCreateAction,
  TransfersDeleteAction,
  TransfersUpdateAction,
} from "./actionCreators";
import { dateToDayStr } from "../helpers/date";

import {
  GOOGLE_API_KEY,
  GOOGLE_CLIENT_ID,
  STORAGE_KEY_ACTIVE_DB,
  STORAGE_KEY_SELECTED_FILE,
} from "../constants";

const CHANGE_EVENT = "CHANGE_EVENT";
const ERROR_EVENT = "ERROR_EVENT";
const SYNC_START_EVENT = "SYNC_CHANGE_EVENT";
const SYNC_SUCCESS_EVENT = "SYNC_SUCCESS_EVENT";
const SYNC_ERROR_EVENT = "SYNC_ERROR_EVENT";

function sortByModifiedAt(a, b) {
  if (a.modifiedAt > b.modifiedAt) {
    return -1;
  }
  if (b.modifiedAt > a.modifiedAt) {
    return 1;
  }
  return 0;
}

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

function gDriveGetSelectedFile() {
  const selectedFile = localStorage.getItem(STORAGE_KEY_SELECTED_FILE);
  if (selectedFile) {
    return JSON.parse(selectedFile);
  }
  return null;
}

let isGDriveReady;
async function gDriveInit() {
  if (isGDriveReady) {
    return;
  }
  try {
    // load client
    await promisify(window.gapi.load)("client:auth2");

    // init client
    await window.gapi.client.init({
      apikey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
      scope: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/spreadsheets",
      ].join(" "),
    });

    isGDriveReady = true;
  } catch (err) {
    const errMsg = `Error trying to initialize gdrive client: ${err.message}`;
    console.error(errMsg, err);
    throw new Error(errMsg);
  }
}

async function isGDriveLoggedIn() {
  await gDriveInit();
  const isLoggedIn = await window.gapi.auth2.getAuthInstance().isSignedIn.get();
  return isLoggedIn;
}

async function getAccountBalance(id) {
  const localDB = await getLocalDB();
  const balance = await localDB.getAccountBalance(id);
  return asMoneyFloat(balance);
}

async function getBalances(accounts) {
  return Promise.all(accounts.map((account) => getAccountBalance(account.id)));
}

async function getTotalWithdrawals({ id, fromDate, toDate }) {
  const localDB = await getLocalDB();
  const withdrawals = await localDB.getTotalWithdrawals({
    id,
    fromDate,
    toDate,
  });
  return asMoneyFloat(withdrawals);
}

async function getTotalDeposits({ id, fromDate, toDate }) {
  const localDB = await getLocalDB();
  const deposits = await localDB.getTotalDeposits({
    id,
    fromDate,
    toDate,
  });
  return asMoneyFloat(deposits);
}

function getMonthlyWithdrawals(accounts) {
  const now = new Date();
  const monthStart = dateToDayStr(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const monthEnd = dateToDayStr(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );
  return Promise.all(
    accounts.map((account) =>
      getTotalWithdrawals({
        id: account.id,
        fromDate: monthStart,
        toDate: monthEnd,
      })
    )
  );
}

// extendAccounts will load new data for the provided accounts
// NOTE: returns a new array. Does NOT mutate the existing array.
async function extendAccounts(accounts, fields) {
  const data = await Promise.all(
    fields.map((field) => {
      switch (field) {
        case "balance":
          return getBalances(accounts);
        case "monthlyWithdrawals":
          return getMonthlyWithdrawals(accounts);
        default:
          throw new Error(`Unknown account field: ${field}`);
      }
    })
  );
  return accounts.map((originalAccount, i) => {
    const newFields = fields.reduce(
      (memo, field, j) => ({
        ...memo,
        [field]: data[j][i],
      }),
      {}
    );
    return { ...originalAccount, ...newFields };
  });
}

async function getAccounts() {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all accounts are pulled from DB
  const localDB = await getLocalDB();
  const allAccounts = await localDB.getAccounts({ from: 0, to: 100 });
  return allAccounts;
}

async function getAccount(id) {
  const localDB = await getLocalDB();
  return localDB.getAccount(id);
}

async function getCategories() {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all categories are pulled from DB
  const localDB = await getLocalDB();
  const allCategories = await localDB.getCategories({ from: 0, to: 100 });
  return allCategories;
}

async function getTransfer(id) {
  const localDB = await getLocalDB();
  return localDB.getTransfer(id);
}

async function getExpense(id) {
  const localDB = await getLocalDB();
  return localDB.getExpense(id);
}

async function getExpenses({
  accountIDs,
  categoryIDs,
  from = 0,
  fromDate,
  orderBy,
  reverse,
  to = 500,
  toDate,
}) {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all categories are pulled from DB
  const localDB = await getLocalDB();
  return localDB.getExpenses({
    fromDate,
    toDate,
    accountIDs,
    categoryIDs,
    orderBy,
    from,
    to,
    reverse,
  });
}

async function getIncomes({
  accountIDs,
  categoryIDs,
  from = 0,
  fromDate,
  orderBy,
  reverse,
  to = 500,
  toDate,
}) {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all categories are pulled from DB
  const localDB = await getLocalDB();
  return localDB.getIncomes({
    fromDate,
    toDate,
    accountIDs,
    categoryIDs,
    orderBy,
    from,
    to,
    reverse,
  });
}

async function getTransfers({
  accountIDs,
  from = 0,
  fromDate,
  orderBy,
  reverse,
  to = 500,
  toDate,
}) {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all categories are pulled from DB
  const localDB = await getLocalDB();
  return localDB.getTransfers({
    fromDate,
    toDate,
    accountIDs,
    orderBy,
    from,
    to,
    reverse,
  });
}

async function getIncome(id) {
  const localDB = await getLocalDB();
  return localDB.getIncome(id);
}

async function getTransactions({
  types = ["INCOME", "EXPENSE", "TRANSFER"],
  accountIDs,
  categoryIDs,
  from = 0,
  fromDate,
  limit = 500,
  orderBy,
  reverse,
  toDate,
}) {
  const localDB = await getLocalDB();
  const [incomes, expenses, transfers] = await Promise.all([
    types.includes("INCOME")
      ? localDB
          .getIncomes({
            accountIDs,
            categoryIDs,
            from,
            fromDate,
            orderBy,
            reverse,
            to: limit,
            toDate,
          })
          .then((result) =>
            result.map((income) => ({ ...income, type: "INCOME" }))
          )
      : Promise.resolve([]),
    types.includes("EXPENSE")
      ? localDB
          .getExpenses({
            accountIDs,
            categoryIDs,
            from,
            fromDate,
            orderBy,
            reverse,
            to: limit,
            toDate,
          })
          .then((result) =>
            result.map((expense) => ({ ...expense, type: "EXPENSE" }))
          )
      : Promise.resolve([]),
    types.includes("TRANSFER")
      ? localDB
          .getTransfers({
            accountIDs,
            from,
            fromDate,
            orderBy,
            reverse,
            to: limit,
            toDate,
          })
          .then((result) =>
            result.map((transfer) => ({ ...transfer, type: "TRANSFER" }))
          )
      : Promise.resolve([]),
  ]);
  return [...incomes, ...expenses, ...transfers]
    .sort(sortByModifiedAt)
    .slice(0, limit);
}

export default function InvoiceZero() {
  const eventEmitter = new EventEmitter();

  function on(event, listener) {
    return eventEmitter.on(event, listener);
  }

  function off(event, listener) {
    return eventEmitter.off(event, listener);
  }

  let syncLock = null;
  function onSyncStart() {
    syncLock = true;
    eventEmitter.emit(SYNC_START_EVENT);
  }

  function onSyncSuccess() {
    syncLock = false;
    eventEmitter.emit(SYNC_SUCCESS_EVENT);
  }

  function onSyncError(err) {
    syncLock = false;
    eventEmitter.emit(SYNC_ERROR_EVENT, err.message);
  }

  async function runSync() {
    if (syncLock) {
      return;
    }
    try {
      onSyncStart();
      await gDriveInit();
      const file = gDriveGetSelectedFile();
      if (!file || !file.id) {
        throw new Error("Tried running sync without a file selected.");
      }
      const localDB = await getLocalDB();
      const newLocalDB = await syncRecursive({
        localDB,
        cloudReplica: await getCloudReplica(),
        appendOnlyLog: new GoogleSpreadsheet({ spreadsheetId: file.id }),
        newLocalDB: () => getLocalDB({ forceNew: true }),
      });
      if (newLocalDB !== localDB) {
        setLocalDB(newLocalDB);
        eventEmitter.emit(CHANGE_EVENT);
      }
      onSyncSuccess();
    } catch (err) {
      onSyncError(err);
    }
  }

  function onChange() {
    eventEmitter.emit(CHANGE_EVENT);
    runSync();
  }

  async function processActions(actions) {
    const localDB = await getLocalDB();
    await localDB.processActions(actions);
    onChange();
  }

  async function createAccount(accountProps) {
    const { name, type, initialBalance } = accountProps;
    const action = new AccountsCreateAction({
      id: uuidv4(),
      name,
      type,
      initialBalance,
      modifiedAt: new Date().toISOString(),
      active: true,
    });
    await processActions([action]);
  }

  async function updateAccount(accountProps) {
    const data = {};
    ["id", "name", "type", "initialBalance"].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(accountProps, key)) {
        data[key] = accountProps[key];
      }
    });
    data.modifiedAt = new Date().toISOString();
    data.active = true;
    const action = new AccountsUpdateAction(data);
    await processActions([action]);
  }

  async function createTransfer(props) {
    const { fromID, toID, amount, description, transactionDate } = props;
    const action = new TransfersCreateAction({
      id: uuidv4(),
      amount,
      fromID,
      toID,
      description,
      transactionDate,
      modifiedAt: new Date().toISOString(),
      deleted: false,
    });
    await processActions([action]);
  }

  async function updateTransfer(props) {
    const data = {};
    [
      "id",
      "fromID",
      "toID",
      "amount",
      "description",
      "transactionDate",
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        data[key] = props[key];
      }
    });
    data.modifiedAt = new Date().toISOString();
    data.deleted = false;
    const action = new TransfersUpdateAction(data);
    await processActions([action]);
  }

  async function deleteTransfer(id) {
    const action = new TransfersDeleteAction({
      id,
      modifiedAt: new Date().toISOString(),
    });
    await processActions([action]);
  }

  async function createExpense(props) {
    const {
      accountID,
      categoryID,
      amount,
      description,
      transactionDate,
    } = props;
    const action = new ExpensesCreateAction({
      id: uuidv4(),
      amount,
      accountID,
      categoryID,
      description,
      transactionDate,
      modifiedAt: new Date().toISOString(),
      deleted: false,
    });
    await processActions([action]);
  }

  async function updateExpense(props) {
    const data = {};
    [
      "id",
      "accountID",
      "categoryID",
      "amount",
      "description",
      "transactionDate",
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        data[key] = props[key];
      }
    });
    data.modifiedAt = new Date().toISOString();
    data.deleted = false;
    const action = new ExpensesUpdateAction(data);
    await processActions([action]);
  }

  async function deleteExpense(id) {
    const action = new ExpensesDeleteAction({
      id,
      modifiedAt: new Date().toISOString(),
    });
    await processActions([action]);
  }

  async function createIncome(props) {
    const {
      accountID,
      categoryID,
      amount,
      description,
      transactionDate,
    } = props;
    const action = new IncomesCreateAction({
      id: uuidv4(),
      amount,
      accountID,
      categoryID,
      description,
      transactionDate,
      modifiedAt: new Date().toISOString(),
      deleted: false,
    });
    await processActions([action]);
  }

  async function updateIncome(props) {
    const data = {};
    [
      "id",
      "accountID",
      "categoryID",
      "amount",
      "description",
      "transactionDate",
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        data[key] = props[key];
      }
    });
    data.modifiedAt = new Date().toISOString();
    data.deleted = false;
    const action = new IncomesUpdateAction(data);
    await processActions([action]);
  }

  async function deleteIncome(id) {
    const action = new IncomesDeleteAction({
      id,
      modifiedAt: new Date().toISOString(),
    });
    await processActions([action]);
  }

  async function gDriveLogin() {
    let isLoggedIn = await isGDriveLoggedIn();
    if (isLoggedIn) {
      return;
    }
    await window.gapi.auth2.getAuthInstance().signIn();
    isLoggedIn = await isGDriveLoggedIn();
    if (isLoggedIn) {
      onChange();
      return;
    }
    throw new Error("Login to GDrive failed.");
  }

  function gDriveSelectFile(file) {
    localStorage.setItem(STORAGE_KEY_SELECTED_FILE, JSON.stringify(file));
    onChange();
  }

  async function gDriveLogout() {
    gDriveSelectFile(null);
    let isLoggedIn = await isGDriveLoggedIn();
    if (!isLoggedIn) {
      return;
    }
    await window.gapi.auth2.getAuthInstance().signOut();
    isLoggedIn = await isGDriveLoggedIn();
    if (!isLoggedIn) {
      onChange();
      return;
    }
    throw new Error("Logout from GDrive failed.");
  }

  function newError(err) {
    eventEmitter.emit(ERROR_EVENT, err);
  }

  async function deleteLocalData() {
    try {
      const cloudReplica = await getCloudReplica();
      await cloudReplica.deleteDB();
      const localDB = await getLocalDB();
      await localDB.deleteDB();
      localStorage.removeItem(STORAGE_KEY_SELECTED_FILE);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_DB);
      await gDriveLogout();
    } catch (err) {
      newError(err);
    }
  }

  return {
    CHANGE_EVENT,
    ERROR_EVENT,
    SYNC_ERROR_EVENT,
    SYNC_START_EVENT,
    SYNC_SUCCESS_EVENT,
    createAccount,
    createExpense,
    createIncome,
    createTransfer,
    deleteExpense,
    deleteIncome,
    deleteLocalData,
    deleteTransfer,
    extendAccounts,
    gDriveGetSelectedFile,
    gDriveLogin,
    gDriveLogout,
    gDriveSelectFile,
    getAccount,
    getAccounts,
    getCategories,
    getExpense,
    getExpenses,
    getIncome,
    getIncomes,
    getTotalDeposits,
    getTotalWithdrawals,
    getTransactions,
    getTransfer,
    getTransfers,
    isGDriveLoggedIn,
    newError,
    off,
    on,
    runSync,
    updateAccount,
    updateExpense,
    updateIncome,
    updateTransfer,
  };
}
