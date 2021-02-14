import { v1 as uuid } from "uuid";
import {
  AccountsCreateAction,
  ExpensesCreateAction,
  CategoriesCreateAction,
} from "../../actionCreators";
import LocalDB from "../db";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name: "testsAccount",
    initialBalance: 0,
    modifiedAt: now,
    ...values,
  };
}

function Category(values) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
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

function Expense(values) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    accountID: uuid(),
    categoryID: uuid(),
    amount: 0,
    description: "test expense",
    transactionDate: now.split("T")[0],
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createExpense(db, values) {
  const action = new ExpensesCreateAction(new Expense(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("expenses/create", () => {
  const tests = [
    {
      name: "new expense is created correctly",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
      },
      action: { accountID: "savings", categoryID: "food", amount: 30 },
      expect: {
        balances: { savings: 70 },
        actionsCount: 3,
        lastAction: { amount: 30 },
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
      },
      action: {
        accountID: "savings",
        categoryID: "food",
        amount: 30,
        modifiedAt: "2020-06-20T17:00:00.000-05:00",
      }, // using -05:00
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
    {
      name: "expense with duplicate id is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
        await createExpense(db, {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "food",
          amount: 30,
        });
      },
      action: {
        id: "gettingPaid",
        fromID: "savings",
        toID: "food",
        amount: 50,
      },
      expect: {
        balances: { savings: 70 },
        actionsCount: 3,
        lastAction: {
          id: "gettingPaid",
          accountID: "savings",
          categoryID: "food",
          amount: 30,
        },
      },
    },
    {
      name: "expense with invalid amount is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
      },
      action: { accountID: "savings", categoryID: "food", amount: -50 },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
    {
      name: "expense using non-existent account is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
      },
      action: { accountID: "nonExistent", categoryID: "food", amount: 30 },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
    {
      name: "expense using deleted: true is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "food" });
      },
      action: {
        accountID: "savings",
        categoryID: "food",
        amount: 30,
        deleted: true,
      },
      expect: {
        balances: { savings: 100 },
        actionsCount: 2,
        lastAction: { id: "food" },
      },
    },
  ];

  tests.forEach((test) => {
    it(test.name, async () => {
      const localDB = await new LocalDB.ByName(uuid());
      try {
        // setup
        if (test.setup) {
          await test.setup(localDB);
        }

        // run action
        const action = new ExpensesCreateAction(new Expense(test.action));
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
