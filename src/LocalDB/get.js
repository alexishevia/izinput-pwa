import { openDB } from 'idb';
import LocalDB from './LocalDB';
import getCloudReplica from '../CloudReplica/get';
import { RULES_VERSION, PAGE_SIZE } from '../constants';

const STORAGE_KEY_ACTIVE_DB = 'activeLocalDB';
const _activeConnections = {};

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

async function dbIsNew(name) {
  const dbs = await window.indexedDB.databases();
  return dbs.map(db => db.name).includes(name) === false;
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

async function getLocalDBByName(name) {
  if (_activeConnections[name]) {
    return _activeConnections[name]
  }

  const isNew = await dbIsNew(name);
  const db = await openDB(name, MIGRATIONS.length, { upgrade: runMigrations });
  const localDB = new LocalDB(db);

  if (isNew) {
    await importCloudReplicaEventsRecursive({ localDB });
  };

   _activeConnections[name] = localDB;
  return _activeConnections[name];
}

export default async function getLocalDB({ forceNew } = {}) {
  let name;
  if (forceNew) {
    name = await getNewLocalDBName();
  } else {
    const activeLocalDBName = localStorage.getItem(STORAGE_KEY_ACTIVE_DB)
    if (activeLocalDBName) {
      return getLocalDBByName(activeLocalDBName)
    }
    name = await getLatestLocalDBName();
  }
  const localDB = await getLocalDBByName(name)
  localStorage.setItem(STORAGE_KEY_ACTIVE_DB, name);
  return localDB;
}
