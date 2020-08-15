import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import syncRecursive from "./sync/sync";
import getLocalDB from "./LocalDB/get";
import setLocalDB from "./LocalDB/set";
import getCloudReplica from "./CloudReplica/get";
import GoogleSpreadsheet from "./AppendOnlyLog/GoogleSpreadsheet";
import {
  AccountsCreateAction,
  AccountsUpdateAction,
  TransfersCreateAction,
  TransfersUpdateAction,
  TransfersDeleteAction,
} from "./actionCreators";

import {
  GOOGLE_API_KEY,
  GOOGLE_CLIENT_ID,
  STORAGE_KEY_SELECTED_FILE,
} from "../constants";

function gDriveSelectFile(file) {
  localStorage.setItem(STORAGE_KEY_SELECTED_FILE, JSON.stringify(file));
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
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
}

async function gDriveLogin() {
  if (isGDriveLoggedIn()) {
    return;
  }
  await window.gapi.auth2.getAuthInstance().signIn();
  if (isGDriveLoggedIn()) {
    return;
  }
  throw new Error("Login to GDrive failed.");
}

async function gDriveLogout() {
  if (!isGDriveLoggedIn()) {
    return;
  }
  await window.gapi.auth2.getAuthInstance().signOut();
  if (!isGDriveLoggedIn()) {
    return;
  }
  throw new Error("Logout from GDrive failed.");
}

// both `from` and `to` are inclusive
async function getAccounts({ from, to }) {
  const localDB = await getLocalDB();
  return localDB.getAccounts({ from, to });
}

// both `from` and `to` are inclusive
async function getTransfers({ from, to }) {
  const localDB = await getLocalDB();
  return localDB.getTransfers({ from, to });
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
  const localDB = await getLocalDB();
  await localDB.processActions([action]);
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
  const localDB = await getLocalDB();
  await localDB.processActions([action]);
}

async function createTransfer(transferProps) {
  const { from, to, amount, description, transferDate } = transferProps;
  const action = new TransfersCreateAction({
    id: uuidv4(),
    amount,
    from,
    to,
    description,
    transferDate,
    modifiedAt: new Date().toISOString(),
    deleted: false,
  });
  const localDB = await getLocalDB();
  await localDB.processActions([action]);
}

async function updateTransfer(transferProps) {
  const data = {};
  ["id", "from", "to", "amount", "description", "transferDate"].forEach(
    (key) => {
      if (Object.prototype.hasOwnProperty.call(transferProps, key)) {
        data[key] = transferProps[key];
      }
    }
  );
  data.modifiedAt = new Date().toISOString();
  data.deleted = false;
  const action = new TransfersUpdateAction(data);
  const localDB = await getLocalDB();
  await localDB.processActions([action]);
}

async function deleteTransfer(id) {
  const action = new TransfersDeleteAction({
    id,
    modifiedAt: new Date().toISOString(),
  });
  const localDB = await getLocalDB();
  await localDB.processActions([action]);
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
  } catch (err) {
    syncLock = false;
    console.error(err);
    throw new Error(`Sync failed: ${err.message}`);
  }
}

export default function InvoiceZero() {
  return {
    createAccount,
    createTransfer,
    deleteTransfer,
    gDriveGetSelectedFile,
    gDriveLogin,
    gDriveLogout,
    gDriveSelectFile,
    getAccounts,
    getTransfers,
    isGDriveLoggedIn,
    runSync,
    updateAccount,
    updateTransfer,
  };
}
