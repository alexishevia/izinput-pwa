import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  TransactionsCreateAction,
  TransactionsDeleteAction,
} from "../../../redux/actionCreators";
import LocalDB from "..";

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

function createTransaction(db, values) {
  const action = new TransactionsCreateAction(new Transaction(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("transactions/delete", () => {
  const tests = [
    {
      name: "transaction is deleted correctly",
      setup: async (db) => {
        await createTransaction(db, {
          id: "game",
          amount: 50,
          modifiedAt: "2020-06-14T17:00:00.000Z",
        });
      },
      action: {
        id: "game",
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        transactions: [],
        categories: [{}],
      },
    },
    {
      name: "transaction with new id is ignored",
      action: { id: "computer", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: { transactions: [], categories: [] },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createTransaction(db, {
          id: "milk",
          amount: 3.0,
          modifiedAt: "2020-06-14T21:00:00.000Z", // using UTC time
        });
      },
      action: { id: "milk", modifiedAt: "2020-06-20T17:00:00.000-05:00" }, // using -05:00
      expect: {
        transactions: [
          { id: "milk", amount: 3.0, modifiedAt: "2020-06-14T21:00:00.000Z" },
        ],
        categories: [{}],
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createTransaction(db, {
          id: "phone",
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: { id: "phone", modifiedAt: "2020-06-14T15:00:00.000Z" },
      expect: {
        transactions: [{ id: "phone", modifiedAt: "2020-06-14T18:00:00.000Z" }],
        categories: [{}],
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
        const action = new TransactionsDeleteAction(test.action);
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
