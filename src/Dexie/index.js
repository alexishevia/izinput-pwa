import Dexie from "dexie";
import indexedDB from "fake-indexeddb";
import FDBKeyRange from "fake-indexeddb/lib/FDBKeyRange";

// fix to get Dexie working in environments with no indexedDB support
if (!window.indexedDB) {
  Dexie.dependencies.indexedDB = indexedDB;
  Dexie.dependencies.IDBKeyRange = FDBKeyRange;
}

export default Dexie;
