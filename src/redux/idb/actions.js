import { getLocalDb } from './api';

// --- action types --- //
export const NEW_DB = 'idb/NEW_DB';

// --- action creators --- //
function _newDb(dbConnection) {
  return { type: NEW_DB, payload: dbConnection };
}

// --- thunk creators --- //

export function init() {
  return async function initThunk(dispatch, getState) {
    const db = await getLocalDb();
    return dispatch(_newDb(db.name))
  }
}

