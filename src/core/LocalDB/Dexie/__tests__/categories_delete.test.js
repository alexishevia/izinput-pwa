import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import {
  CategoriesCreateAction,
  CategoriesDeleteAction,
} from "../../../actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function Category(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv1(),
    name: "testsCategory",
    modifiedAt: now,
    deleted: false,
    ...values,
  };
}

function createCategory(db, values) {
  const action = new CategoriesCreateAction(new Category(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("categories/delete", () => {
  const tests = [
    {
      name: "transfer is deleted correctly",
      setup: async (db) => {
        await createCategory(db, {
          id: "food",
          name: "Food",
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "food", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: {
        categories: [{ id: "food", deleted: true }],
        actionsCount: 2,
        lastAction: {
          id: "food",
          modifiedAt: "2020-06-14T17:50:00.000Z",
        },
      },
    },
    {
      name: "action with new id is ignored",
      action: { id: "computer", modifiedAt: "2020-06-14T17:50:00.000Z" },
      expect: {
        categories: [],
        actionsCount: 0,
      },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createCategory(db, {
          id: "food",
          name: "Food",
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: {
        id: "food",
        modifiedAt: "2020-06-20T17:00:00.000-05:00", // using -05:00
      },
      expect: {
        balances: { savings: 50, food: 50 },
        categories: [{ id: "food", deleted: false }],
        actionsCount: 1,
        lastAction: { id: "food", deleted: false },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createCategory(db, {
          id: "food",
          name: "Food",
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
      },
      action: { id: "food", modifiedAt: "2020-06-14T05:00:00.000Z" },
      expect: {
        balances: { savings: 50, food: 50 },
        categories: [{ id: "food", deleted: false }],
        actionsCount: 1,
        lastAction: { id: "food", deleted: false },
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

        // run categories assertions
        const gotCategories = await localDB.getCategories({ from: 0, to: 50 });
        expect(gotCategories).toHaveLength(test.expect.categories.length);
        test.expect.categories.forEach((expectCategory, i) => {
          const gotCategory = gotCategories[i];
          Object.entries(expectCategory).forEach(([key, val]) => {
            expect(gotCategory[key]).toEqual(val);
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
