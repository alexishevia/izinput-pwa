import { v4 as uuidv4 } from "uuid";
import { CategoriesCreateAction } from "../../../actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function Category(values) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
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

/* --- test start --- */

describe("categories/create", () => {
  const tests = [
    {
      name: "new category is created correctly",
      action: { id: "candy", initialBalance: 0 },
      expect: {
        categories: [{ id: "candy", initialBalance: 0 }],
        actionsCount: 1,
        lastAction: { id: "candy", initialBalance: 0 },
      },
    },
    {
      name: "using a timezone other than UTC is ignored",
      action: { modifiedAt: "2020-06-20T17:00:00.000-05:00" }, // using -05:00
      expect: {
        categories: [],
        actionsCount: 0,
      },
    },
    {
      name: "category with duplicate id is ignored",
      setup: async (db) => {
        await createCategory(db, { id: "milk", name: "Milk" });
      },
      action: { id: "milk", name: "2%" },
      expect: {
        categories: [{ id: "milk", name: "Milk" }],
        actionsCount: 1,
        lastAction: { id: "milk", name: "Milk" },
      },
    },
    {
      name: "category using deleted: true is ignored",
      action: { id: "electronics", name: "Electronics", deleted: true },
      expect: {
        categories: [],
        actionsCount: 0,
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
        const action = new CategoriesCreateAction(new Category(test.action));
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
