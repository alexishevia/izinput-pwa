import { v4 as uuidv4 } from "uuid";
import getLocalDB from "./LocalDB/get";
import { AccountsCreateAction, TransfersCreateAction } from "./actionCreators";

// import {promisify} from "util";
// import {GOOGLE_API_KEY, GOOGLE_CLIENT_ID} from "../constants";

// const STORAGE_KEY_SELECTED_FILE = "gDriveSelectedFile";

// TODO:
// use this to find current GDrive sign in status of user
// window.gapi.auth2.getAuthInstance().isSignedIn.get()

// function getSelectedFile() {
//   const selectedFile = localStorage.getItem(STORAGE_KEY_SELECTED_FILE);
//   if (selectedFile) {
//     return JSON.parse(selectedFile);
//   }
//   return null;
// }

export default function InvoiceZero() {
  // async function initGDrive() {
  //   try {
  //     // load client
  //     await promisify(window.gapi.load)("client:auth2");

  //     // init client
  //     await window.gapi.client.init({
  //       apikey: GOOGLE_API_KEY,
  //       clientId: GOOGLE_CLIENT_ID,
  //       discoveryDocs: [
  //         "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  //         "https://sheets.googleapis.com/$discovery/rest?version=v4",
  //       ],
  //       scope: [
  //         "https://www.googleapis.com/auth/drive.readonly",
  //         "https://www.googleapis.com/auth/spreadsheets",
  //       ].join(" "),
  //     });

  //   } catch (err) {
  //     const errMsg = `Error trying to initialize gdrive client: ${err.message}`;
  //     console.error(errMsg, err);
  //     throw new Error(errMsg);
  //   }
  // }

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

  return {
    getAccounts,
    getTransfers,
    createAccount,
    createTransfer,
  };
}
