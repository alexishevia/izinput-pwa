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
  STORAGE_KEY_SELECTED_FILE,
} from "../constants";

const CHANGE_EVENT = "CHANGE_EVENT";

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
async function initGDrive() {
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
  await initGDrive();
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

async function getCategories() {
  // TODO: instead of hardcoding the `from` and `to` values, should iterate until all categories are pulled from DB
  const localDB = await getLocalDB();
  const allCategories = await localDB.getCategories({ from: 0, to: 100 });
  return allCategories;
}

// both `from` and `to` are inclusive
async function getTransfers({ from, to }) {
  const localDB = await getLocalDB();
  return localDB.getTransfers({ from, to });
}

async function getTransfer(id) {
  const localDB = await getLocalDB();
  return localDB.getTransfer(id);
}

async function getExpense(id) {
  const localDB = await getLocalDB();
  return localDB.getExpense(id);
}

async function getIncome(id) {
  const localDB = await getLocalDB();
  return localDB.getIncome(id);
}

async function getRecentTransfers() {
  const localDB = await getLocalDB();
  return localDB.getRecentTransfers({ from: 0, to: 15 });
}

const recentCount = 15;
async function getRecentTransactions() {
  const localDB = await getLocalDB();
  const [incomes, expenses, transfers] = await Promise.all([
    localDB
      .getRecentIncomes({ from: 0, to: recentCount })
      .then((result) =>
        result.map((income) => ({ ...income, type: "INCOME" }))
      ),
    localDB
      .getRecentExpenses({ from: 0, to: recentCount })
      .then((result) =>
        result.map((expense) => ({ ...expense, type: "EXPENSE" }))
      ),
    localDB
      .getRecentTransfers({ from: 0, to: recentCount })
      .then((result) =>
        result.map((transfer) => ({ ...transfer, type: "TRANSFER" }))
      ),
  ]);
  return [...incomes, ...expenses, ...transfers]
    .sort(sortByModifiedAt)
    .slice(0, recentCount);
}

export default function InvoiceZero() {
  const eventEmitter = new EventEmitter();

  function on(event, listener) {
    return eventEmitter.on(event, listener);
  }

  function off(event, listener) {
    return eventEmitter.off(event, listener);
  }

  function emitChange() {
    return eventEmitter.emit(CHANGE_EVENT);
  }

  async function processActions(actions) {
    const localDB = await getLocalDB();
    await localDB.processActions(actions);
    emitChange();
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
      emitChange();
      return;
    }
    throw new Error("Login to GDrive failed.");
  }

  async function gDriveLogout() {
    let isLoggedIn = await isGDriveLoggedIn();
    if (!isLoggedIn) {
      return;
    }
    await window.gapi.auth2.getAuthInstance().signOut();
    isLoggedIn = await isGDriveLoggedIn();
    if (!isLoggedIn) {
      emitChange();
      return;
    }
    throw new Error("Logout from GDrive failed.");
  }

  function gDriveSelectFile(file) {
    localStorage.setItem(STORAGE_KEY_SELECTED_FILE, JSON.stringify(file));
    emitChange();
  }

  let syncLock = null;
  async function runSync() {
    const file = gDriveGetSelectedFile();
    if (!file || !file.id) {
      throw new Error("Tried running sync without a file selected.");
    }
    if (syncLock) {
      console.warn("Sync is already running.");
      return;
    }
    try {
      syncLock = true;
      const newLocalDB = await syncRecursive({
        localDB: await getLocalDB(),
        cloudReplica: await getCloudReplica(),
        appendOnlyLog: new GoogleSpreadsheet({ spreadsheetId: file.id }),
        newLocalDB: () => getLocalDB({ forceNew: true }),
      });
      setLocalDB(newLocalDB);
      syncLock = false;
      emitChange();
    } catch (err) {
      syncLock = false;
      console.error(err);
      throw new Error(`Sync failed: ${err.message}`);
    }
  }

  const oldExportedFuncs = {
    createTransfer,
    deleteTransfer,
    gDriveGetSelectedFile,
    gDriveLogin,
    gDriveLogout,
    gDriveSelectFile,
    getAccountBalance,
    getRecentTransfers,
    getTotalWithdrawals,
    getTransfers,
    isGDriveLoggedIn,
    runSync,
    updateAccount,
  };

  return {
    ...oldExportedFuncs,
    CHANGE_EVENT,
    createAccount,
    createExpense,
    createIncome,
    deleteExpense,
    deleteIncome,
    extendAccounts,
    getAccounts,
    getCategories,
    getExpense,
    getIncome,
    getRecentTransactions,
    getTransfer,
    off,
    on,
    updateExpense,
    updateIncome,
    updateTransfer,
  };
}
