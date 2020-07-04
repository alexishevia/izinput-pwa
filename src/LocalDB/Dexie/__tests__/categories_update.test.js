import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  TransactionsCreateAction,
  CategoriesCreateAction,
  CategoriesDeleteAction,
  CategoriesUpdateAction,
} from "../../../redux/actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function createCategory(db, id) {
  const action = new CategoriesCreateAction(id);
  return db.processActions([action]);
}

function deleteCategory(db, id) {
  const action = new CategoriesDeleteAction(id);
  return db.processActions([action]);
}

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

function createTransaction(db, values) {
  const action = new TransactionsCreateAction(new Transaction(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("categories/update", () => {
  const tests = [
    {
      name: "category is renamed correctly",
      setup: (db) => createCategory(db, "electronics"),
      action: { from: "electronics", to: "ELECTRONICS" },
      expect: {
        transactions: [],
        categories: ["ELECTRONICS"],
        actionsCount: 2,
        lastAction: { from: "electronics", to: "ELECTRONICS" },
      },
    },
    {
      name: "action with blank 'from' is renamed correctly",
      setup: async (db) => {
        await createTransaction(db, { id: "Shenaniganz", category: "food" });
        await deleteCategory(db, "food");
      },
      action: { from: "", to: "restaurants" },
      expect: {
        transactions: [{ id: "Shenaniganz", category: "restaurants" }],
        categories: ["restaurants"],
        actionsCount: 3,
        lastAction: { from: "", to: "restaurants" },
      },
    },
    {
      name: "action with blank 'to' is ignored",
      setup: (db) => createCategory(db, "food"),
      action: { from: "food", to: "" },
      expect: {
        transactions: [],
        categories: ["food"],
        actionsCount: 1,
        lastAction: "food",
      },
    },
    {
      name: "action with new id is ignored",
      setup: (db) => createCategory(db, "food"),
      action: { from: "golf", to: "sports" },
      expect: {
        transactions: [],
        categories: ["food"],
        actionsCount: 1,
        lastAction: "food",
      },
    },
    {
      name: "updates transactions to match new category name",
      setup: async (db) => {
        await createTransaction(db, {
          id: "computer",
          category: "electronics",
        });
        await createTransaction(db, { id: "dinner", category: "food" });
      },
      action: { from: "electronics", to: "work" },
      expect: {
        transactions: [
          { id: "computer", category: "work" },
          { id: "dinner", category: "food" },
        ],
        categories: ["food", "work"],
        actionsCount: 3,
        lastAction: { from: "electronics", to: "work" },
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
        const action = new CategoriesUpdateAction(test.action);
        await localDB.processActions([action]);

        // run transactions assertions
        const gotTxs = await localDB.getTransactions({ from: 0, to: 50 });
        expect(gotTxs).toHaveLength(test.expect.transactions.length);
        test.expect.transactions.forEach((expectTx, i) => {
          const gotTx = gotTxs[i];
          Object.entries(expectTx).forEach(([key, val]) => {
            expect(gotTx[key]).toEqual(val);
          });
        });

        // run categories assertions
        const gotCats = await localDB.getCategories();
        expect(gotCats).toHaveLength(test.expect.categories.length);
        test.expect.categories.forEach((expectCat, i) => {
          const gotCat = gotCats[i];
          Object.entries(expectCat).forEach(([key, val]) => {
            expect(gotCat[key]).toEqual(val);
          });
        });

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
