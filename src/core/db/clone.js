import getLocalDB from "./getLocalDB";
import { PAGE_SIZE } from "../../constants";

async function cloneCollectionRecursive({
  fromCollection,
  toCollection,
  offset,
}) {
  let done = true;
  const lowerBound = offset || 0;
  const upperBound = lowerBound + PAGE_SIZE;
  await fromCollection
    .offset(lowerBound)
    .limit(upperBound - lowerBound + 1)
    .each((item, cursor) => {
      done = false;
      return toCollection.put(item, cursor.key);
    });

  if (done) {
    return Promise.resolve();
  }

  return cloneCollectionRecursive({
    fromCollection,
    toCollection,
    offset: upperBound + 1,
  });
}

function cloneDB(sourceDB, destDB) {
  const tableNames = sourceDB.dexie.tables.map((t) => t.name);
  return tableNames
    .reduce(
      (prevStep, tableName) =>
        prevStep.then(() =>
          cloneCollectionRecursive({
            fromCollection: sourceDB.dexie[tableName],
            toCollection: destDB.dexie[tableName],
          })
        ),
      Promise.resolve()
    )
    .then(() => destDB);
}

export default function clone(sourceDB) {
  return getLocalDB({ forceNew: true }).then((destDB) =>
    cloneDB(sourceDB, destDB)
  );
}
