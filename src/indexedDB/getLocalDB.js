import { openDB } from 'idb';
import { MIGRATIONS, runMigrations } from './migrations';

const _dbConnections = {};

const localDbName = {
  regex: /local(\d+)/,
  template: 'local<NUM>',
};

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
  if (!_dbConnections[name]) {
    const conn = await openDB(name, MIGRATIONS.length, { upgrade: runMigrations });
    _dbConnections[name] = conn;
  }
  return _dbConnections[name];
}

