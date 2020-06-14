import { v4 as uuidv4 } from "uuid";
import LocalDB from "../LocalDB";

/* --- helper functions --- */

function CategoriesCreateAction(name) {
  return {
    version: 1,
    type: "categories/create",
    payload: name,
  };
}

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
      expect: { categories: ["food"] },
    },
    {
      name: "blank category is ignored",
      action: "",
      expect: { categories: [] },
    },
    {
      name: "duplicate category is ignored",
      setup: async (db) => {
        await createCategory(db, "electronics");
      },
      action: "electronics",
      expect: { categories: ["electronics"] },
    },
    {
      name: "category names are case-sensitive",
      setup: async (db) => {
        await createCategory(db, "electronics");
      },
      action: "ELECTRONICS",
      expect: { categories: ["electronics", "ELECTRONICS"] },
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
      } catch (err) {
        if (localDB) {
          localDB.deleteDB();
        } // cleanup
        throw err;
      }
    });
  });
});
