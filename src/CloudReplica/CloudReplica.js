async function checkStoreEmpty({ dbTx }) {
  const count = await dbTx.objectStore("actions").count();
  if (count !== 0) {
    throw new Error(`expected store to be empty. count: ${count}`)
  }
}

async function checkConflicts({ dbTx, expectedLastAction, expectedLastIndex }) {
  const count = await dbTx.objectStore("actions").count();
  if (count !== expectedLastIndex) {
    throw new Error(`CloudReplicaConflict. expectedLastIndex: ${expectedLastIndex} vs actualLastIndex: ${count}`);
  }
  const lastAction = await dbTx.objectStore("actions").get(count);
  if (lastAction !== expectedLastAction) {
    throw new Error(`CloudReplicaConflict. expectedLastAction: ${expectedLastAction} vs actualLastAction: ${lastAction}`);
  }
}

export default function CloudReplica(db) {
  function getActions({ from, to }) {
    // the actions store uses an autoincrement key (starting at 1).
    //
    // To retrieve all actions without duplicates, keep calling this
    // function using `from: previous to + 1`
    return db.getAll("actions", IDBKeyRange.bound(from, to));
  }

  async function append({ actions, from }) {
    const dbTx = db.transaction(["actions"], "readwrite");
    try {
      // the first action being appended should match the last action in the DB.
      // Otherwise, a conflict error is thrown.
      if (from === 1) {
        await checkStoreEmpty({ dbTx });
      } else {
        const expectedLastAction = actions.shift();
        await checkConflicts({ dbTx, expectedLastAction, expectedLastIndex: from });
      }

      // append to 'actions' store
      for (const action of actions) {
        await dbTx.objectStore("actions").put(action);
      }

      await dbTx.done;
    } catch(err) {
      await dbTx.abort();
      throw err;
    }
  }

  // returns the amount of processed actions
  async function getActionsCount(){
    const count = await db.count('actions');
    return count || 0;
  }

  async function getLastAction() {
    // given that:
    // * the 'actions' store auto-increment key starts at 1, AND
    // * we never delete actions from the cloudReplica
    // the last action's key is the same as the actions count.
    const count = await getActionsCount();
    if (!count) {
      return undefined;
    }
    return db.get("actions", count);
  }

  return {
    append,
    getActionsCount,
    getLastAction,
    getActions,
  };
}
