export const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_API_KEY) {
  throw new Error("missing GOOGLE_API_KEY. Cannot start.");
}

if (!GOOGLE_CLIENT_ID) {
  throw new Error("missing GOOGLE_CLIENT_ID. Cannot start.");
}
