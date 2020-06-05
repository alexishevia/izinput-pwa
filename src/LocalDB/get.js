import { openDB, deleteDB } from 'idb';
import LocalDB from './LocalDB';
import getCloudReplica from '../CloudReplica/get';
import { RULES_VERSION, PAGE_SIZE } from '../constants';

const STORAGE_KEY_ACTIVE_DB = 'activeLocalDB';

const localDBName = {
  regex: /([^_\s]+)_local_(\d+)/,
  template: '<VERSION>_local_<NUM>',
};

const MIGRATIONS = [
  function V0toV1(db) {
    db.createObjectStore('localActions', { autoIncrement: true });
    db.createObjectStore('meta', { autoIncrement: false });
    db.createObjectStore('transactions', { keyPath: "id", autoIncrement: false });
    db.createObjectStore('categories', { keyPath: "id", autoIncrement: false });
  },
];

function runMigrations(db) {
  MIGRATIONS.forEach((runMigration, version) => {
    if (db.version <= version + 1) {
      runMigration(db);
    }
  })
}

function newLocalDBName(num) {
  return localDBName.template
    .replace('<VERSION>', RULES_VERSION)
    .replace('<NUM>', num || 0);
}

async function getLatestLocalDBNumber() {
  const dbs = await window.indexedDB.databases()
  const val = dbs
    .map(db => db.name)
    .map(name => (localDBName.regex.exec(name) || [])[2])
    .filter(Boolean)
    .sort()
    .reverse()[0] || 0;
  const num = parseInt(val, 10);
  if (Number.isNaN(num)) {
    throw new Error('LatestLocalDBNumber cannot be parsed to int:', val);
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

async function importCloudReplicaEventsRecursive({ cloudReplica, localDB, from }) {
  let cloudDB = cloudReplica || (await getCloudReplica());
  const lowerBound = (from || 0);
  const upperBound = lowerBound + PAGE_SIZE;
  const actions = await cloudDB.getActions({ from: lowerBound, to: upperBound });
  if (!actions.length) {
    return; // done
  }
  await localDB.processActions(actions.map(JSON.parse), { actionsAreRemote: true });
  return importCloudReplicaEventsRecursive({ cloudReplica, localDB, from: upperBound + 1 });
}

async function copyLocalActions({ fromDB, toDB }) {
  const localActions = await fromDB.getLocalActions();
  await toDB.processActions(localActions);
}

async function getLocalDBByName(name) {
  const db = await openDB(name, MIGRATIONS.length, { upgrade: runMigrations });
  return new LocalDB({ name, db });
}

async function getActiveLocalDB() {
  const name = localStorage.getItem(STORAGE_KEY_ACTIVE_DB)
  return (name) ? (await getLocalDBByName(name)) : null;
}

async function getLatestLocalDB() {
  const name = await getLatestLocalDBName();
  const localDB = await getLocalDBByName(name)
  await deleteLocalDBs({ except: name });
  return localDB;
}

async function deleteLocalDBs({ except }) {
  const dbs = await window.indexedDB.databases();
  return Promise.all(
    dbs.map(db => db.name)
    .filter(name => name !== except && localDBName.regex.exec(name))
    .map(deleteDB)
  );
}

async function getNewLocalDB({ activeDB }) {
  const name = await getNewLocalDBName();
  const localDB = await getLocalDBByName(name);
  await importCloudReplicaEventsRecursive({ localDB });
  if (activeDB) {
    await copyLocalActions({ fromDB: activeDB, toDB: localDB });
  }
  return localDB;
}

export default async function getLocalDB({ forceNew } = {}) {
  const activeDB = await getActiveLocalDB();
  if (activeDB && !forceNew) {
    await deleteLocalDBs({ except: activeDB.name });
    return activeDB;
  }
  const getDBPromise = forceNew ? getNewLocalDB({ activeDB }) : getLatestLocalDB();
  const localDB = await getDBPromise;
  localStorage.setItem(STORAGE_KEY_ACTIVE_DB, localDB.name);
  return localDB;
}
