import { openDB } from 'idb';
import CloudReplica from './CloudReplica';

let _activeCloudReplica;

const MIGRATIONS = [
  function V0toV1(db) {
    db.createObjectStore('actions', { autoIncrement: true });
  },
]

function runMigrations(db) {
  MIGRATIONS.forEach((runMigration, version) => {
    if (db.version <= version + 1) {
      runMigration(db);
    }
  })
}

export default async function getCloudReplica() {
  if (!_activeCloudReplica) {
    const db = await openDB('cloudReplica', MIGRATIONS.length, { upgrade: runMigrations });
    _activeCloudReplica = new CloudReplica(db);
  }
  return _activeCloudReplica;
}
