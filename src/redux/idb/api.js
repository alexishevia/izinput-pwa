const _dbConnections = {};

const localDbName = {
  regex: /local(\d+)/,
  template: 'local<NUM>',
};

function newLocalDbName(num) {
  return localDbName.template.replace('<NUM>', num || 0);
}

async function getLatestLocalDbName() {
  try {
    const dbs = await window.indexedDB.databases()
    const num = dbs
      .map(db => db.name)
      .map(name => (localDbName.regex.exec(name) || [])[1])
      .filter(Boolean)
      .sort()
      .reverse()[0]
    return newLocalDbName(num);
  } catch(err) {
    return newLocalDbName();
  }
}

async function openDBConnection(name) {
  const openRequest = window.indexedDB.open(name);
  return new Promise((resolve, reject) => {
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onerror = (evt) => reject(evt);
  });
}

export async function getLocalDb() {
  const name = await getLatestLocalDbName();
  if (!_dbConnections[name]) {
    const conn = await openDBConnection(name);
    _dbConnections[name] = conn;
  }
  return _dbConnections[name];
}
