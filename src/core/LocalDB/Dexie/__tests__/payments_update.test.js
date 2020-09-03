import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  CategoriesCreateAction,
  PaymentsCreateAction,
  PaymentsDeleteAction,
  PaymentsUpdateAction,
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

function Category(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    name: "testscategory",
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createCategory(db, values) {
  const action = new CategoriesCreateAction(new Category(values));
  return db.processActions([action]);
}

function Payment(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    accountID: uuidv1(),
    categoryID: uuidv1(),
    amount: 0,
    description: "test payment",
    transactionDate: now.split("T")[0],
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createPayment(db, values) {
  const action = new PaymentsCreateAction(new Payment(values));
  return db.processActions([action]);
}

function deletePayment(db, values) {
  const action = new PaymentsDeleteAction(values);
  return db.processActions([action]);
}

/* --- test start --- */

describe("payments/update", () => {
  const tests = [
    {
      name: "payment is updated correctly",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        amount: 10,
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        balances: { savings: 110 },
        actionsCount: 4,
        lastAction: { id: "gettingPaid", amount: 10 },
      },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        amount: 10,
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 150 },
        actionsCount: 3,
        lastAction: { id: "gettingPaid", amount: 50 },
      },
    },
    {
      name: "action with new id is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "newID",
        amount: 10,
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 150 },
        actionsCount: 3,
        lastAction: { id: "gettingPaid", amount: 50 },
      },
    },
    {
      name: "action without valid modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        amount: 10,
        modifiedAt: "hello", // using -05:00
      },
      expect: {
        balances: { savings: 150 },
        actionsCount: 3,
        lastAction: { id: "gettingPaid", amount: 50 },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        amount: 10,
        modifiedAt: "2020-06-14T05:00:00.000Z",
      },
      expect: {
        balances: { savings: 150 },
        actionsCount: 3,
        lastAction: { id: "gettingPaid", amount: 50 },
      },
    },
    {
      name:
        "action with 'deleted: true' is ignored (payments/delete must be used instead)",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        modifiedAt: "2020-06-14T17:50:00.000Z",
        deleted: true,
      },
      expect: {
        balances: { savings: 150 },
        actionsCount: 3,
        lastAction: { id: "gettingPaid", amount: 50 },
      },
    },
    {
      name: "running an update on a deleted payment 'un-deletes' the payment",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
        await deletePayment(db, {
          id: "gettingPaid",
          modifiedAt: "2020-06-14T15:00:00.000Z",
        });
      },
      action: {
        id: "gettingPaid",
        amount: 10,
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        balances: { savings: 110 },
        actionsCount: 5,
        lastAction: { id: "gettingPaid", amount: 10 },
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
        const action = new PaymentsUpdateAction(test.action);
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