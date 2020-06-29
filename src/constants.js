export const RULES_VERSION = 1;
export const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// amount of objects to fetch per page
// applies to both polling from Google Spreadsheet and iterating through indexedDB
export const PAGE_SIZE = 25;

// the "active" local db name is kept on Local Storage, using this key
export const STORAGE_KEY_ACTIVE_DB = "activeLocalDB";

if (!RULES_VERSION) {
  throw new Error("missing RULES_VERSION. Cannot start.");
}

if (!GOOGLE_API_KEY) {
  throw new Error("missing GOOGLE_API_KEY. Cannot start.");
}

if (!GOOGLE_CLIENT_ID) {
  throw new Error("missing GOOGLE_CLIENT_ID. Cannot start.");
}
