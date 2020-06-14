import { v1 as uuidv1 } from "uuid";
import LocalDB from "../LocalDB";

/* --- helper functions --- */

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

describe("transactions/create", () => {
  const tests = [
    {
      name: "new transaction and new category are created correctly",
      action: { id: "buyingCandy", amount: 1.5, category: "CANDY" },
      expect: {
        transactions: [{ id: "buyingCandy", amount: 1.5, category: "CANDY" }],
        categories: ["CANDY"],
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      action: { modifiedAt: "2020-06-20T17:00:00.000-05:00" }, // using -05:00
      expect: {
        transactions: [],
        categories: [],
      },
    },
    {
      name: "action with duplicate id is ignored",
      setup: async (db) => {
        await createTransaction(db, {
          id: "milk",
          amount: 3.0,
          category: "GROCERIES",
        });
      },
      action: { id: "milk", amount: 1.25, category: "SUPERMARKET" },
      expect: {
        transactions: [{ id: "milk", amount: 3.0, category: "GROCERIES" }],
        categories: ["GROCERIES"],
      },
    },
    {
      name: "action with invalid amount is ignored",
      action: { id: "invalidAmount", amount: -5 },
      expect: { transactions: [], categories: [] },
    },
    {
      name:
        "action with duplicate category is created, but no category is added",
      setup: async (db) => {
        await createTransaction(db, { category: "OFFICE" });
      },
      action: { id: "buyingInk", category: "OFFICE" },
      expect: {
        transactions: [
          { category: "OFFICE" },
          { id: "buyingInk", category: "OFFICE" },
        ],
        categories: ["OFFICE"],
      },
    },
    {
      name: "action with 'deleted: true' is ignored",
      action: { id: "buyingLaptop", deleted: true },
      expect: { transactions: [], categories: [] },
    },
  ];

  tests.forEach((test) => {
    it(test.name, async () => {
      const localDB = await new LocalDB.ByName(uuidv1());
      try {
        // setup
        if (test.setup) {
          await test.setup(localDB);
        }

        // run action
        const action = new TransactionsCreateAction(test.action);
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
