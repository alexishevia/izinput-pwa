import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  PaymentsCreateAction,
  CategoriesCreateAction,
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
    ...values,
  };
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

function createAccount(db, values) {
  const action = new AccountsCreateAction(new Account(values));
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

/* --- test start --- */

describe("payments/create", () => {
  const tests = [
    {
      name: "new payment is created correctly",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
      },
      action: { accountID: "savings", categoryID: "freelance", amount: 30 },
      expect: {
        balances: { savings: 130 },
        actionsCount: 3,
        lastAction: { amount: 30 },
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
      },
      action: {
        accountID: "savings",
        categoryID: "freelance",
        amount: 30,
        modifiedAt: "2020-06-20T17:00:00.000-05:00",
      }, // using -05:00
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "freelance" },
      },
    },
    {
      name: "payment with duplicate id is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createPayment(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 30,
        });
      },
      action: {
        id: "gettingPaid",
        fromID: "savings",
        toID: "freelance",
        amount: 50,
      },
      expect: {
        balances: { savings: 130 },
        actionsCount: 3,
        lastAction: {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "freelance",
          amount: 30,
        },
      },
    },
    {
      name: "payment with invalid amount is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
      },
      action: { accountID: "savings", categoryID: "freelance", amount: -50 },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "freelance" },
      },
    },
    {
      name: "payment using non-existent account is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
      },
      action: { accountID: "nonExistent", categoryID: "freelance", amount: 30 },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "freelance" },
      },
    },
    {
      name: "payment using deleted: true is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
      },
      action: {
        accountID: "savings",
        categoryID: "freelance",
        amount: 30,
        deleted: true,
      },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "freelance" },
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
        const action = new PaymentsCreateAction(new Payment(test.action));
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
