import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import { TransactionsCreateAction } from "../../redux/actionCreators";
import sync from "../sync";
import LocalDB from "../../LocalDB/Dexie";
import CloudReplica from "../../CloudReplica/Dexie";
import AppendOnlyLog from "../../AppendOnlyLog/InMemoryLog";

/* --- helper functions --- */

function Transaction(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    amount: 99.99,
    type: "CREDIT",
    cashFlow: "EXPENSE",
    category: "Sample Category",
    description: "Sample Description",
    transactionDate: now.split("T")[0],
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createTransactions(db, values) {
  return db.processActions(
    values.map((val) => new TransactionsCreateAction(new Transaction(val)))
  );
}

/* --- test start --- */

describe("sync", () => {
  const tests = [
    {
      name: "sync a new localDB to an empty cloudReplica",
      setup: async () => {
        return {
          localDB: await new LocalDB.ByName(uuidv4()),
          cloudReplica: await new CloudReplica.ByName(uuidv4()),
          appendOnlyLog: await new AppendOnlyLog(),
        };
      },
      expect: {
        categories: [],
        transactions: [],
        initialSavings: 0,
      },
    },
    {
      name: "sync existing app to a new app",
      setup: async () => {
        // the old app and new app will share the same append-only log
        const appendOnlyLog = await new AppendOnlyLog();

        // old app
        const oldLocalDB = await new LocalDB.ByName(uuidv4());
        await createTransactions(oldLocalDB, [
          { id: "bread", category: "food", amount: 1.5 },
          { id: "milk", category: "food", amount: 2.0 },
        ]);

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
        categories: ["food"],
        transactions: [
          { id: "bread", category: "food", amount: 1.5 },
          { id: "milk", category: "food", amount: 2.0 },
        ],
        initialSavings: 0,
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

        // run transactions assertions
        const gotTxs = await syncedLocalDB.getTransactions({ from: 0, to: 50 });
        expect(gotTxs).toHaveLength(test.expect.transactions.length);
        test.expect.transactions.forEach((expectTx, i) => {
          const gotTx = gotTxs[i];
          Object.entries(expectTx).forEach(([key, val]) => {
            expect(gotTx[key]).toEqual(val);
          });
        });

        // run categories assertions
        const gotCats = await syncedLocalDB.getCategories();
        expect(gotCats).toHaveLength(test.expect.categories.length);
        test.expect.categories.forEach((expectCat, i) => {
          const gotCat = gotCats[i];
          Object.entries(expectCat).forEach(([key, val]) => {
            expect(gotCat[key]).toEqual(val);
          });
        });

        // run initialSavings assertions
        const got = await syncedLocalDB.getInitialSavings();
        expect(got).toBe(test.expect.initialSavings);
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
