export const MIGRATIONS = [
  function V0toV1(db) {
    db.createObjectStore('localActions', { autoIncrement: true });
    db.createObjectStore('transactions', { keyPath: "id", autoIncrement: false });
    db.createObjectStore('categories', { keyPath: "id", autoIncrement: false });
  },
]

export function runMigrations(db) {
  MIGRATIONS.forEach((runMigration, version) => {
    if (db.version <= version + 1) {
      runMigration(db);
    }
  })
}
