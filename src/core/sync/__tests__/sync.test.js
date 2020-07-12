import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  TransfersCreateAction,
} from "../../actionCreators";
import sync from "../sync";
import LocalDB from "../../LocalDB/Dexie";
import CloudReplica from "../../CloudReplica/Dexie";
import AppendOnlyLog from "../../AppendOnlyLog/InMemoryLog";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    name: "testsAccount",
    type: "INTERNAL",
    initialBalance: 0,
    modifiedAt: now,
    active: true,
    ...values,
  };
}

function createAccount(db, values) {
  const action = new AccountsCreateAction(new Account(values));
  return db.processActions([action]);
}

function Transfer(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    from: uuidv1(),
    to: uuidv1(),
    amount: 0,
    description: "test transfer",
    transferDate: now.split("T")[0],
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createTransfer(db, values) {
  const action = new TransfersCreateAction(new Transfer(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("sync", () => {
  const tests = [
    // {
    //   name: "sync a new localDB to an empty cloudReplica",
    //   setup: async () => {
    //     return {
    //       localDB: await new LocalDB.ByName(uuidv4()),
    //       cloudReplica: await new CloudReplica.ByName(uuidv4()),
    //       appendOnlyLog: await new AppendOnlyLog(),
    //     };
    //   },
    //   expect: {
    //     balances: {},
    //   },
    // },
    {
      name: "sync existing app to a new app",
      setup: async () => {
        // the old app and new app will share the same append-only log
        const appendOnlyLog = await new AppendOnlyLog();

        // old app
        const oldLocalDB = await new LocalDB.ByName(uuidv4());
        await createAccount(oldLocalDB, { id: "savings", initialBalance: 100 });
        await createAccount(oldLocalDB, { id: "food" });
        await createTransfer(oldLocalDB, {
          from: "savings",
          to: "food",
          amount: 50,
        });

        // sync old app to the append-only log
        await sync({
          localDB: oldLocalDB,
          cloudReplica: await new CloudReplica.ByName(uuidv4()),
          appendOnlyLog,
        });

        return {
          localDB: await new LocalDB.ByName(uuidv4()),
          cloudReplica: await new CloudReplica.ByName(uuidv4()),
          appendOnlyLog,
        };
      },
      expect: {
        balances: { savings: 50, food: 50 },
      },
    },
  ];

  tests.forEach((test) => {
    it(test.name, async () => {
      let localDB;
      let syncedLocalDB;
      let cloudReplica;
      let appendOnlyLog;

      try {
        // setup
        ({ localDB, cloudReplica, appendOnlyLog } = await test.setup());

        // run sync
        syncedLocalDB = await sync({
          localDB,
          cloudReplica,
          appendOnlyLog,
          newLocalDB: () => new LocalDB.ByName(uuidv4()),
        });

        // run balances assertions
        /* eslint no-restricted-syntax: [0] */
        for (const [key, val] of Object.entries(test.expect.balances)) {
          const gotBalance = await syncedLocalDB.getAccountBalance(key);
          expect(gotBalance).toEqual(val);
        }
      } catch (err) {
        // cleanup
        if (localDB) {
          await localDB.deleteDB();
        }
        if (syncedLocalDB) {
          await syncedLocalDB.deleteDB();
        }
        if (cloudReplica) {
          await cloudReplica.deleteDB();
        }
        throw err;
      }
    });
  });
});
