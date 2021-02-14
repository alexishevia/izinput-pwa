import { v1 as uuid } from "uuid";
import {
  AccountsCreateAction,
  ExpensesCreateAction,
  ExpensesDeleteAction,
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

describe("expenses/delete", () => {
  const tests = [
    {
      name: "expense is deleted correctly",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createExpense(db, {
          id: "food",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "food", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: {
        balances: { savings: 100 },
        actionsCount: 4,
        lastAction: { id: "food", modifiedAt: "2020-06-14T17:50:00.000Z" },
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
        await createCategory(db, { id: "freelance" });
        await createExpense(db, {
          id: "food",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "food",
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 50 },
        actionsCount: 3,
        lastAction: { id: "food", amount: 50 },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "savings", initialBalance: 100 });
        await createCategory(db, { id: "freelance" });
        await createExpense(db, {
          id: "food",
          accountID: "savings",
          categoryID: "freelance",
          amount: 50,
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "food", modifiedAt: "2020-06-14T05:00:00.000Z" },
      expect: {
        balances: { savings: 50 },
        actionsCount: 3,
        lastAction: { id: "food", amount: 50 },
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
        const action = new ExpensesDeleteAction(new Expense(test.action));
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
