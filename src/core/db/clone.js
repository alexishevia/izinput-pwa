import getLocalDB from "./getLocalDB";

function cloneCollection(sourceCollection, destCollection) {
  return sourceCollection.each((item, cursor) => {
    return destCollection.put(item, cursor.key);
  });
}

function cloneDB(sourceDB, destDB) {
  const tableNames = sourceDB.dexie.tables.map((t) => t.name);
  return Promise.all(
    tableNames.map((tableName) => {
      return cloneCollection(
        sourceDB.dexie[tableName],
        destDB.dexie[tableName]
      );
    })
  ).then(() => destDB);
}

export default function clone(sourceDB) {
  return getLocalDB({ forceNew: true }).then((destDB) =>
    cloneDB(sourceDB, destDB)
  );
}
