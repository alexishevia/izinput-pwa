import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
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

function TransactionsUpdateAction(values) {
  return {
    version: 1,
    type: "transactions/update",
    payload: values,
  };
}

function TransactionsDeleteAction({ id, modifiedAt }) {
  return {
    version: 1,
    type: "transactions/delete",
    payload: { id, modifiedAt },
  };
}

function createTransaction(db, values) {
  const action = new TransactionsCreateAction(values);
  return db.processActions([action]);
}

function deleteTransaction(db, values) {
  const action = new TransactionsDeleteAction(values);
  return db.processActions([action]);
}

/* --- test start --- */

describe("transactions/update", () => {
  const tests = [
    {
      name: "transaction is updated correctly",
      setup: async (db) => {
        await createTransaction(db, {
          id: "milk",
          amount: 3.0,
          category: "GROCERIES",
          modifiedAt: "2020-06-14T17:00:00.000Z",
        });
      },
      action: {
        id: "milk",
        amount: 2.5,
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        transactions: [
          {
            id: "milk",
            amount: 2.5,
            category: "GROCERIES",
            modifiedAt: "2020-06-14T17:50:00.000Z",
          },
        ],
        categories: ["GROCERIES"],
      },
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
      action: {
        id: "milk",
        amount: 2.5,
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        transactions: [
          {
            id: "milk",
            amount: 3.0,
            modifiedAt: "2020-06-14T21:00:00.000Z",
          },
        ],
        categories: [{}],
      },
    },
    {
      name: "transaction with new id is ignored",
      action: {
        id: "computer",
        amount: 1500,
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: { transactions: [], categories: [] },
    },
    {
      name: "transaction without valid modifiedAt is ignored",
      setup: async (db) => {
        await createTransaction(db, { id: "computer", amount: 1800 });
      },
      action: { id: "computer", amount: 1500, modifiedAt: "foo" },
      expect: {
        transactions: [{ id: "computer", amount: 1800 }],
        categories: [{}],
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createTransaction(db, {
          id: "phone",
          amount: 400,
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        amount: 600,
        modifiedAt: "2020-06-14T15:00:00.000Z",
      },
      expect: {
        transactions: [
          { id: "phone", amount: 400, modifiedAt: "2020-06-14T18:00:00.000Z" },
        ],
        categories: [{}],
      },
    },
    {
      name:
        "action with 'deleted: true' is ignored (transactions/delete must be used instead)",
      setup: async (db) => {
        await createTransaction(db, {
          id: "phone",
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        deleted: true,
        modifiedAt: "2020-06-14T20:00:00.000Z",
      },
      expect: {
        transactions: [{ id: "phone", deleted: false }],
        categories: [{}],
      },
    },
    {
      name:
        "running an update on a deleted transaction 'undeletes' the transaction",
      setup: async (db) => {
        await createTransaction(db, {
          id: "phone",
          amount: 700,
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
        await deleteTransaction(db, {
          id: "phone",
          modifiedAt: "2020-06-14T19:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        amount: 500,
        modifiedAt: "2020-06-14T20:00:00.000Z",
      },
      expect: {
        transactions: [
          {
            id: "phone",
            amount: 500,
            deleted: false,
            modifiedAt: "2020-06-14T20:00:00.000Z",
          },
        ],
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
        const action = new TransactionsUpdateAction(test.action);
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
