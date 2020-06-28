import Dexie from "dexie";
import shimIndexedDb from "indexeddbshim";

// fix to get Dexie working in environments with no indexedDB support
const shim = {};
shimIndexedDb(shim, { checkOrigin: false });
const { indexedDB, IDBKeyRange } = shim;
Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

// ByName returns a new CloudReplica instance, backed by a Dexie db with name: `$name`.
function ByName(name) {
  const db = new Dexie(name);

  // run migrations
  db.version(1).stores({
    actions: "++", // primary key hidden and auto-incremented
  });

  function append(actions) {
    return db.actions.bulkAdd(actions);
  }

  // both `from` and `to` are inclusive
  function getActions({ from, to }) {
    return db.actions
      .offset(from)
      .limit(to - from + 1)
      .toArray();
  }

  function getActionsCount() {
    return db.actions.count();
  }

  function getLastAction() {
    return db.actions.reverse().first();
  }

  function deleteDB() {
    return db.delete();
  }

  return {
    append,
    deleteDB,
    getActions,
    getActionsCount,
    getLastAction,
  };
}

export default {
  ByName,
};
