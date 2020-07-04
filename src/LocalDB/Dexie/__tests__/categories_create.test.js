import { v4 as uuidv4 } from "uuid";
import { CategoriesCreateAction } from "../../../redux/actionCreators";
import LocalDB from "..";

/* --- helper functions --- */

function createCategory(db, name) {
  const action = new CategoriesCreateAction(name);
  return db.processActions([action]);
}

/* --- test start --- */

describe("categories/create", () => {
  const tests = [
    {
      name: "new category is created correctly",
      action: "food",
      expect: {
        categories: ["food"],
        actionsCount: 1,
        lastAction: "food",
      },
    },
    {
      name: "blank category is ignored",
      action: "",
      expect: {
        categories: [],
        actionsCount: 0,
      },
    },
    {
      name: "duplicate category is ignored",
      setup: async (db) => {
        await createCategory(db, "electronics");
      },
      action: "electronics",
      expect: {
        categories: ["electronics"],
        // categories/create uses "PUT" behind the scenes.
        // Because PUT is idempotent, even if a new category is not created,
        // the action still gets recorded.
        actionsCount: 2,
        lastAction: "electronics",
      },
    },
    {
      name: "category names are case-sensitive",
      setup: async (db) => {
        await createCategory(db, "electronics");
      },
      action: "ELECTRONICS",
      expect: {
        categories: ["electronics", "ELECTRONICS"],
        actionsCount: 2,
        lastAction: "ELECTRONICS",
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
        const action = new CategoriesCreateAction(test.action);
        await localDB.processActions([action]);

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
          expect(gotLastAction.payload).toEqual(test.expect.lastAction);
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
