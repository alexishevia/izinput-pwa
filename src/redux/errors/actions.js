// --- action types --- //
export const ADD = 'errors/add';
export const RESET = 'errors/reset';

// --- action creators --- //

export function add(err) {
  const msg = err.message || err;
  if (!msg || !msg.length) {
    console.error('errors/actions#add: invalid err', err);
    return {};
  }
  return { type: ADD, payload: msg };
}

export function reset() {
  return { type: RESET };
}
