import { STORAGE_KEY_ACTIVE_DB } from "../constants";

// set the active local DB
export default function setLocalDB(db) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_DB, db.name);
}
