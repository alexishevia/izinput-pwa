import { openDB } from 'idb';
import LocalDb from './LocalDb';

const _activeConnections = {};

const localDbName = {
  regex: /local(\d+)/,
  template: 'local<NUM>',
};

const MIGRATIONS = [
  function V0toV1(db) {
    db.createObjectStore('localActions', { autoIncrement: true });
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

function newLocalDbName(num) {
  return localDbName.template.replace('<NUM>', num || 0);
}

async function getLatestLocalDbName() {
  const dbs = await window.indexedDB.databases()
  const num = dbs
    .map(db => db.name)
    .map(name => (localDbName.regex.exec(name) || [])[1])
    .filter(Boolean)
    .sort()
    .reverse()[0]
  return newLocalDbName(num);
}

export default async function getLocalDb() {
  const name = await getLatestLocalDbName();
  if (!_activeConnections[name]) {
    const db = await openDB(name, MIGRATIONS.length, { upgrade: runMigrations });
    _activeConnections[name] = new LocalDb(db);
  }
  return _activeConnections[name];
}
