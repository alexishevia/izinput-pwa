import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import LocalDB from "../LocalDB";

/* --- helper functions --- */

function CategoriesCreateAction(name) {
  return {
    version: 1,
    type: "categories/create",
    payload: name,
  };
}

function CategoriesUpdateAction({ from, to }) {
  return {
    version: 1,
    type: "categories/update",
    payload: { from, to },
  };
}

function createCategory(db, name) {
  const action = new CategoriesCreateAction(name);
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

function TransactionsCreateAction(values) {
  return {
    version: 1,
    type: "transactions/create",
    payload: new Transaction(values),
  };
}

function createTransaction(db, values) {
  const action = new TransactionsCreateAction(values);
  return db.processActions([action]);
}

/* --- test start --- */

describe("categories/update", () => {
  const tests = [
    {
      name: "category is renamed correctly",
      setup: (db) => createCategory(db, "electronics"),
      action: { from: "electronics", to: "ELECTRONICS" },
      expect: { transactions: [], categories: ["ELECTRONICS"] },
    },
    {
      name: "action with new id is ignored",
      setup: (db) => createCategory(db, "food"),
      action: { from: "golf", to: "sports" },
      expect: { transactions: [], categories: ["food"] },
    },
    {
      name: "action with blank 'to' is ignored",
      setup: (db) => createCategory(db, "food"),
      action: { from: "food", to: "" },
      expect: { transactions: [], categories: ["food"] },
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
        const gotTxs = await localDB.getTransactions();
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
      } catch (err) {
        if (localDB) {
          localDB.deleteDB();
        } // cleanup
        throw err;
      }
    });
  });
});
