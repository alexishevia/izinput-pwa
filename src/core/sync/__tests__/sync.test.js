/* eslint no-inner-declarations:[0] */

import { v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  TransfersCreateAction,
} from "../../actionCreators";
import sync from "../sync";
import cloneDB from "../../db/clone";
import DB from "../../db/db";
import AppendOnlyLog from "../../AppendOnlyLog/InMemoryLog";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: "testsAccount",
    type: "INTERNAL",
    initialBalance: 0,
    modifiedAt: now,
    active: true,
    ...values,
  };
}

function createAccount(values) {
  return new AccountsCreateAction(new Account(values));
}

function Transfer(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    fromID: uuidv4(),
    toID: uuidv4(),
    amount: 0,
    description: "test transfer",
    transactionDate: now.split("T")[0],
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createTransfer(values) {
  return new TransfersCreateAction(new Transfer(values));
}

async function cleanup(dbs) {
  return dbs.reduce((prevStep, db) => {
    return prevStep.then(() => (db ? db.deleteDB() : Promise.resolve()));
  }, Promise.resolve());
}

/* --- test start --- */

describe("sync", () => {
  const tests = [
    {
      name: "sync two apps, where one has data and the other is empty",
      setup: async ({ dbARun, dbASync, dbBSync }) => {
        // add data to dbA
        await dbARun([
          createAccount({ id: "savings", initialBalance: 100 }),
          createAccount({ id: "food" }),
          createTransfer({ fromID: "savings", toID: "food", amount: 50 }),
        ]);

        // sync dbA to the append-only log
        await dbASync();

        // sync dbB to the append-only log
        await dbBSync();
      },
      expect: {
        balances: { savings: 50, food: 50 },
      },
    },
    {
      name: "sync two apps with data",
      setup: async ({ dbARun, dbASync, dbBRun, dbBSync }) => {
        // add data to dbA
        await dbARun([
          createAccount({ id: "savings", initialBalance: 100 }),
          createAccount({ id: "food", initialBalance: 0 }),
        ]);

        // sync dbA to the append-only log
        await dbASync();

        // sync dbB to the append-only log
        await dbBSync();

        // run operation on dbA
        await dbARun([
          createTransfer({ fromID: "savings", toID: "food", amount: 20 }),
        ]);

        // run operation on dbB
        await dbBRun([
          createTransfer({ fromID: "savings", toID: "food", amount: 50 }),
        ]);

        // sync both apps
        await dbASync();
        await dbBSync();
        await dbASync();
      },
      expect: {
        balances: { savings: 30, food: 70 },
      },
    },
  ];

  tests.forEach((test) => {
    it(test.name, async () => {
      let dbA;
      let dbB;
      const dbACloudReplica = await new DB.ByName(uuidv4());
      const dbBCloudReplica = await new DB.ByName(uuidv4());
      const dbsToCleanup = [dbACloudReplica, dbBCloudReplica];
      const appendOnlyLog = await new AppendOnlyLog();

      function dbARun(actions) {
        return dbA.processActions(actions);
      }

      async function dbASync() {
        dbA = await sync({
          cloudReplica: dbACloudReplica,
          localDB: dbA,
          appendOnlyLog,
          cloneDB,
        });
        dbsToCleanup.push(dbA);
      }

      function dbBRun(actions) {
        return dbB.processActions(actions);
      }

      async function dbBSync() {
        dbB = await sync({
          cloudReplica: dbBCloudReplica,
          localDB: dbB,
          appendOnlyLog,
          cloneDB,
        });
        dbsToCleanup.push(dbB);
      }

      try {
        // setup
        dbA = await new DB.ByName(uuidv4());
        dbB = await new DB.ByName(uuidv4());
        dbsToCleanup.push(dbA, dbB);
        await test.setup({ dbARun, dbASync, dbBRun, dbBSync });

        // run balances assertions
        /* eslint no-restricted-syntax: [0] */
        for (const [key, val] of Object.entries(test.expect.balances)) {
          const balanceA = await dbA.getAccountBalance(key);
          expect(balanceA).toEqual(val);

          const balanceB = await dbB.getAccountBalance(key);
          expect(balanceB).toEqual(val);
        }

        await cleanup(dbsToCleanup);
      } catch (err) {
        await cleanup(dbsToCleanup);
        throw err;
      }
    });
  });
});
