export default function MemoryBasedAppendOnlyLog() {
  let actions = [];

  // return actions by index
  // This emulates spreadsheet behavior:
  // - uses 1-based indexing (not 0-based indexing)
  // - `from` and `to` are inclusive
  function getActions({ from, to }) {
    return Promise.resolve(actions.slice(from - 1, from + to));
  }

  function appendActions(newActions) {
    actions = [...actions, ...newActions];
    return Promise.resolve();
  }

  return {
    getActions,
    appendActions,
  };
}
