import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  TransfersCreateAction,
  TransfersDeleteAction,
  TransfersUpdateAction,
} from "../../../actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    name: "testsAccount",
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

function deleteTransfer(db, values) {
  const action = new TransfersDeleteAction(values);
  return db.processActions([action]);
}

/* --- test start --- */

describe("transfers/update", () => {
  const tests = [
    {
      name: "transfer is updated correctly",
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
        amount: 10,
        modifiedAt: "2020-06-14T10:50:00.000Z",
      },
      expect: {
        balances: { savings: 90, food: 10 },
        actionsCount: 4,
        lastAction: {
          id: "buyingFood",
          amount: 10,
          modifiedAt: "2020-06-14T10:50:00.000Z",
        },
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
        amount: 10,
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: { id: "buyingFood", amount: 50 },
      },
    },
    {
      name: "action with new id is ignored",
      action: { id: "buyingFood", amount: 10 },
      expect: {
        balances: {},
        actionsCount: 0,
      },
    },
    {
      name: "action without valid modifiedAt is ignored",
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
      action: { id: "buyingFood", amount: 10, modifiedAt: "hello" },
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
      action: {
        id: "buyingFood",
        amount: 10,
        modifiedAt: "2020-06-14T05:00:00.000Z",
      },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: { id: "buyingFood", amount: 50 },
      },
    },
    {
      name:
        "action with 'deleted: true' is ignored (transfers/delete must be used instead)",
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
        amount: 10,
        deleted: true,
      },
      expect: {
        balances: { savings: 50, food: 50 },
        actionsCount: 3,
        lastAction: { id: "buyingFood", amount: 50 },
      },
    },
    {
      name: "running an update on a deleted transfer 'un-deletes' the transfer",
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
        await deleteTransfer(db, {
          id: "buyingFood",
          modifiedAt: "2020-06-14T20:00:00.000Z",
        });
      },
      action: {
        id: "buyingFood",
        amount: 10,
        modifiedAt: "2020-06-14T22:00:00.000Z",
      },
      expect: {
        balances: { savings: 90, food: 10 },
        actionsCount: 5,
        lastAction: { id: "buyingFood", amount: 10 },
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
        const action = new TransfersUpdateAction(test.action);
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
