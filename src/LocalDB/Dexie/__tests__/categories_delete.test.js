import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  TransactionsCreateAction,
  CategoriesCreateAction,
  CategoriesDeleteAction,
} from "../../../redux/actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function createCategory(db, id) {
  const action = new CategoriesCreateAction(id);
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

describe("categories/delete", () => {
  const tests = [
    {
      name: "category is deleted correctly",
      setup: (db) => createCategory(db, "electronics"),
      action: "electronics",
      expect: { transactions: [], categories: [] },
    },
    {
      name: "action with new id is ignored",
      action: "food",
      expect: { transactions: [], categories: [] },
    },
    {
      name: "updates transactions to have blank category",
      setup: async (db) => {
        await createTransaction(db, { id: "phone", category: "electronics" });
        await createTransaction(db, { id: "shenaniganz", category: "food" });
      },
      action: "food",
      expect: {
        transactions: [
          { id: "phone", category: "electronics" },
          { id: "shenaniganz", category: "" },
        ],
        categories: ["electronics"],
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
        const action = new CategoriesDeleteAction(test.action);
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
      } catch (err) {
        if (localDB) {
          localDB.deleteDB();
        } // cleanup
        throw err;
      }
    });
  });
});
