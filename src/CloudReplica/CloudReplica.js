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
  async function append({ actions, from }) {
    const dbTx = db.transaction(["actions"], "readwrite");

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
  }

  // returns the last index (aka row number) that was downloaded from google spreadsheets
  async function getLastIndex(){
    return await db.count('actions');
  }

  return {
    append,
    getLastIndex,
  };
}
