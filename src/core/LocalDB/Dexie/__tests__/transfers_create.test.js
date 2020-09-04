import { v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  TransfersCreateAction,
} from "../../../actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: "testsAccount",
    initialBalance: 0,
    modifiedAt: now,
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

function createTransfer(db, values) {
  const action = new TransfersCreateAction(new Transfer(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("transfers/create", () => {
  const tests = [
    {
      name: "new transfer is created correctly",
      setup: async (db) => {
        await createAccount(db, {
          id: "savings",
          initialBalance: 100,
        });
        await createAccount(db, { id: "food" });
      },
      action: { fromID: "savings", toID: "food", amount: 30 },
      expect: {
        balances: { savings: 70, food: 30 },
        actionsCount: 3,
        lastAction: { fromID: "savings", toID: "food" },
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, {
          id: "savings",
          initialBalance: 100,
        });
        await createAccount(db, { id: "food" });
      },
      action: {
        fromID: "savings",
        toID: "food",
        amount: 30,
        modifiedAt: "2020-06-20T17:00:00.000-05:00",
      }, // using -05:00
      expect: {
        balances: { savings: 100, food: 0 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
    {
      name: "transfer with duplicate id is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createAccount(db, { id: "food" });
        await createTransfer(db, {
          id: "buyingFood",
          fromID: "savings",
          toID: "food",
          amount: 50,
        });
      },
      action: { id: "buyingFood", fromID: "savings", toID: "food", amount: 30 },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: {
          id: "buyingFood",
          fromID: "savings",
          toID: "food",
          amount: 50,
        },
      },
    },
    {
      name: "transfer with invalid amount is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createAccount(db, { id: "food" });
      },
      action: {
        id: "invalidAmount",
        fromID: "savings",
        toID: "food",
        amount: -50,
      },
      expect: {
        balances: { savings: 100, food: 0 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
    {
      name: "transfer using non-existent account is ignored",
      action: { fromID: "foo", toID: "bar", amount: 50 },
      expect: {
        balances: {},
        actionsCount: 0,
      },
    },
    {
      name: "transfer using deleted: true is ignored",
      setup: async (db) => {
        await createAccount(db, {
          id: "savings",
          initialBalance: 100,
        });
        await createAccount(db, { id: "food" });
      },
      action: { fromID: "savings", toID: "food", amount: 30, deleted: true },
      expect: {
        balances: {
          savings: 100,
          food: 0,
        },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
  ];

  tests.forEach((test) => {
    it(test.name, async () => {
      const localDB = await new LocalDB.ByName(uuidv4());
      try {
        // setup
        if (test.setup) {
          await test.setup(localDB);
        }

        // run action
        const action = new TransfersCreateAction(new Transfer(test.action));
        await localDB.processActions([action]);

        // run balances assertions
        /* eslint no-restricted-syntax: [0] */
        for (const [key, val] of Object.entries(test.expect.balances)) {
          const gotBalance = await localDB.getAccountBalance(key);
          expect(gotBalance).toEqual(val);
        }

        // run actionsCount assertions
        const gotActionsCount = await localDB.getActionsCount();
        expect(gotActionsCount).toEqual(test.expect.actionsCount);

        // run lastAction assertions
        const lastActionStr = await localDB.getLastAction();
        if (lastActionStr && !test.expect.lastAction) {
          throw new Error(`expected no lastAction. got: ${lastActionStr}`);
        }
        if (test.expect.lastAction) {
          const gotLastAction = JSON.parse(lastActionStr);
          Object.entries(test.expect.lastAction).forEach(([key, val]) => {
            expect(gotLastAction.payload[key]).toEqual(val);
          });
        }
      } catch (err) {
        if (localDB) {
          localDB.deleteDB();
        } // cleanup
        throw err;
      }
    });
  });
});
