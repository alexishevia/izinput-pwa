import { v1 as uuid } from "uuid";
import { AccountsCreateAction } from "../../../actionCreators";
import LocalDB from "..";

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

function createAccount(db, values) {
  const action = new AccountsCreateAction(new Account(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("accounts/create", () => {
  const tests = [
    {
      name: "new account is created correctly",
      action: { id: "candy", initialBalance: 0 },
      expect: {
        accounts: [{ id: "candy", initialBalance: 0 }],
        actionsCount: 1,
        lastAction: { id: "candy", initialBalance: 0 },
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      action: { modifiedAt: "2020-06-20T17:00:00.000-05:00" }, // using -05:00
      expect: {
        accounts: [],
        actionsCount: 0,
      },
    },
    {
      name: "account with duplicate id is ignored",
      setup: async (db) => {
        await createAccount(db, { id: "milk", name: "Milk" });
      },
      action: { id: "milk", name: "2%" },
      expect: {
        accounts: [{ id: "milk", name: "Milk" }],
        actionsCount: 1,
        lastAction: { id: "milk", name: "Milk" },
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
        const action = new AccountsCreateAction(new Account(test.action));
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
