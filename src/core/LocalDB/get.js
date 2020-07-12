import Dexie from "dexie";
import LocalDB from "./Dexie";
import { RULES_VERSION, STORAGE_KEY_ACTIVE_DB } from "../../constants";
import setLocalDB from "./set";

const localDBName = {
  regex: /([^_\s]+)_local_(\d+)/,
  template: "<VERSION>_local_<NUM>",
};

function newLocalDBName(num) {
  return localDBName.template
    .replace("<VERSION>", RULES_VERSION)
    .replace("<NUM>", num || 0);
}

async function getLatestLocalDBNumber() {
  const dbs = await window.indexedDB.databases();
  const val =
    dbs
      .map((db) => db.name)
      .map((name) => (localDBName.regex.exec(name) || [])[2])
      .filter(Boolean)
      .sort()
      .reverse()[0] || 0;
  const num = parseInt(val, 10);
  if (Number.isNaN(num)) {
    throw new Error("LatestLocalDBNumber cannot be parsed to int:", val);
  }
  return num;
}

async function getLatestLocalDBName() {
  const latestNumber = await getLatestLocalDBNumber();
  return newLocalDBName(latestNumber);
}

async function getNewLocalDBName() {
  const latestNumber = await getLatestLocalDBNumber();
  return newLocalDBName(latestNumber + 1);
}

async function getActiveLocalDB() {
  const name = localStorage.getItem(STORAGE_KEY_ACTIVE_DB);
  return name ? new LocalDB.ByName(name) : null;
}

async function getLatestLocalDB() {
  const name = await getLatestLocalDBName();
  return new LocalDB.ByName(name);
}

async function getNewLocalDB() {
  const name = await getNewLocalDBName();
  return new LocalDB.ByName(name);
}

async function deleteLocalDBs({ except }) {
  const dbs = await window.indexedDB.databases();
  return Promise.all(
    dbs
      .map((db) => db.name)
      .filter((name) => name !== except && localDBName.regex.exec(name))
      .map(Dexie.delete)
  );
}

export default async function getLocalDB({ forceNew, deleteOldDBs } = {}) {
  if (forceNew) {
    return getNewLocalDB();
  }
  const localDB = (await getActiveLocalDB()) || (await getLatestLocalDB());
  setLocalDB(localDB);
  if (deleteOldDBs) {
    await deleteLocalDBs({ except: localDB.name });
  }
  return localDB;
}
