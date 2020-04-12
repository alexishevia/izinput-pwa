export function isInitialized(state) {
  return !!state.idb.localDb;
}
