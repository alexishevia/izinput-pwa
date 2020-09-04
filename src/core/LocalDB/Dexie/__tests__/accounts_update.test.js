import { v4 as uuidv4 } from "uuid";
import {
  AccountsCreateAction,
  AccountsUpdateAction,
} from "../../../actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function Account(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: "testsAccount",
    initialBalance: 0,
    modifiedAt: now,
    ...values,
  };
}

function createAccount(db, values) {
  const action = new AccountsCreateAction(new Account(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("accounts/update", () => {
  const tests = [
    {
      name: "account is updated correctly",
      setup: async (db) => {
        await createAccount(db, {
          id: "milk",
          name: "Milk",
          initialBalance: 0,
          modifiedAt: "2020-06-14T17:00:00.000Z",
        });
      },
      action: {
        id: "milk",
        name: "2%",
        initialBalance: 100,
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        accounts: [
          {
            id: "milk",
            name: "2%",
            initialBalance: 100,
            modifiedAt: "2020-06-14T17:50:00.000Z",
          },
        ],
        actionsCount: 2,
        lastAction: { id: "milk", name: "2%", initialBalance: 100 },
      },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createAccount(db, {
          id: "milk",
          name: "Milk",
          modifiedAt: "2020-06-14T21:00:00.000Z", // using UTC time
        });
      },
      action: {
        id: "milk",
        name: "2%",
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        accounts: [
          { id: "milk", name: "Milk", modifiedAt: "2020-06-14T21:00:00.000Z" },
        ],
        actionsCount: 1,
        lastAction: { id: "milk", name: "Milk" },
      },
    },
    {
      name: "action with new id is ignored",
      action: {
        id: "computers",
        name: "Computers",
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: { accounts: [], actionsCount: 0 },
    },
    {
      name: "action without valid modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "computers", initialBalance: 1800 });
      },
      action: { id: "computers", initialBalance: 1500, modifiedAt: "foo" },
      expect: {
        accounts: [{ id: "computers", initialBalance: 1800 }],
        actionsCount: 1,
        lastAction: { id: "computers", initialBalance: 1800 },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createAccount(db, {
          id: "phone",
          initialBalance: 400,
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        initialBalance: 600,
        modifiedAt: "2020-06-14T15:00:00.000Z",
      },
      expect: {
        accounts: [
          {
            id: "phone",
            initialBalance: 400,
            modifiedAt: "2020-06-14T18:00:00.000Z",
          },
        ],
        actionsCount: 1,
        lastAction: { id: "phone", initialBalance: 400 },
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
        const action = new AccountsUpdateAction(test.action);
        await localDB.processActions([action]);

        // run accounts assertions
        const gotAccounts = await localDB.getAccounts({ from: 0, to: 50 });
        expect(gotAccounts).toHaveLength(test.expect.accounts.length);
        test.expect.accounts.forEach((expectAccount, i) => {
          const gotAccount = gotAccounts[i];
          Object.entries(expectAccount).forEach(([key, val]) => {
            expect(gotAccount[key]).toEqual(val);
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
