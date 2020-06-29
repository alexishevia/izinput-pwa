// --- action types --- //

export const SET = "categories/set";

// --- action creators --- //

export function set(categories) {
  return { type: SET, payload: categories };
}
