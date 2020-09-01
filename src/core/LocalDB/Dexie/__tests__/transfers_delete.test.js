import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  TransfersCreateAction,
  TransfersDeleteAction,
} from "../../../actionCreators";
import LocalDB from "..";

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
    fromID: uuidv1(),
    toID: uuidv1(),
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

describe("transfers/delete", () => {
  const tests = [
    {
      name: "transfer is deleted correctly",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createAccount(db, { id: "food" });
        await createTransfer(db, {
          id: "buyingFood",
          fromID: "savings",
          toID: "food",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "buyingFood", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: {
        balances: { savings: 100, food: 0 },
        actionsCount: 4,
        lastAction: {
          id: "buyingFood",
          modifiedAt: "2020-06-14T17:50:00.000Z",
        },
      },
    },
    {
      name: "action with new id is ignored",
      action: { id: "computer", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: {
        balances: {},
        actionsCount: 0,
      },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createAccount(db, { id: "food" });
        await createTransfer(db, {
          id: "buyingFood",
          fromID: "savings",
          toID: "food",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "buyingFood",
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: { id: "buyingFood", amount: 50 },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createAccount(db, { id: "food" });
        await createTransfer(db, {
          id: "buyingFood",
          fromID: "savings",
          toID: "food",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "buyingFood", modifiedAt: "2020-06-14T05:00:00.000Z" },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: { id: "buyingFood", amount: 50 },
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
        const action = new TransfersDeleteAction(test.action);
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
