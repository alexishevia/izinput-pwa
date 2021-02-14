import { v1 as uuid } from "uuid";
import {
  CategoriesCreateAction,
  CategoriesUpdateAction,
  CategoriesDeleteAction,
} from "../../actionCreators";
import LocalDB from "../db";

/* --- helper functions --- */

function Category(values) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
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

function deleteCategory(db, values) {
  const action = new CategoriesDeleteAction(new Category(values));
  return db.processActions([action]);
}

/* --- test start --- */

describe("categories/update", () => {
  const tests = [
    {
      name: "category is updated correctly",
      setup: async (db) => {
        await createCategory(db, {
          id: "milk",
          name: "Milk",
          modifiedAt: "2020-06-14T17:00:00.000Z",
        });
      },
      action: {
        id: "milk",
        name: "2%",
        modifiedAt: "2020-06-14T17:50:00.000Z",
      },
      expect: {
        categories: [
          {
            id: "milk",
            name: "2%",
            modifiedAt: "2020-06-14T17:50:00.000Z",
          },
        ],
        actionsCount: 2,
        lastAction: { id: "milk", name: "2%" },
      },
    },
    {
      name: "action using a timezone other than UTC is ignored",
      setup: async (db) => {
        await createCategory(db, {
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
        categories: [
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
      expect: { categories: [], actionsCount: 0 },
    },
    {
      name: "action without valid modifiedAt is ignored",
      setup: async (db) => {
        await createCategory(db, { id: "computers" });
      },
      action: { id: "computers", name: "New Name", modifiedAt: "foo" },
      expect: {
        categories: [{ id: "computers" }],
        actionsCount: 1,
        lastAction: { id: "computers" },
      },
    },
    {
      name:
        "action with modifiedAt earlier than existing modifiedAt is ignored",
      setup: async (db) => {
        await createCategory(db, {
          id: "phone",
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        name: "New Name",
        modifiedAt: "2020-06-14T15:00:00.000Z",
      },
      expect: {
        categories: [
          {
            id: "phone",
            modifiedAt: "2020-06-14T18:00:00.000Z",
          },
        ],
        actionsCount: 1,
        lastAction: { id: "phone" },
      },
    },
    {
      name:
        "action with 'deleted: true' is ignored (categories/delete must be used instead)",
      setup: async (db) => {
        await createCategory(db, {
          id: "phone",
          modifiedAt: "2020-06-14T18:00:00.000Z",
        });
      },
      action: {
        id: "phone",
        name: "New Phone",
        modifiedAt: "2020-06-14T18:11:00.000Z",
        deleted: true,
      },
      expect: {
        categories: [{ id: "phone", modifiedAt: "2020-06-14T18:00:00.000Z" }],
        actionsCount: 1,
        lastAction: { id: "phone" },
      },
    },
    {
      name: "running an update on a deleted category 'un-deletes' the category",
      setup: async (db) => {
        await createCategory(db, {
          id: "food",
          name: "Food",
          modifiedAt: "2020-06-14T10:00:00.000Z",
        });
        await deleteCategory(db, {
          id: "food",
          modifiedAt: "2020-06-14T20:00:00.000Z",
        });
      },
      action: {
        id: "food",
        name: "New Food",
        modifiedAt: "2020-06-14T22:00:00.000Z",
      },
      expect: {
        categories: [{ id: "food", name: "New Food", deleted: false }],
        actionsCount: 3,
        lastAction: { id: "food", name: "New Food" },
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
        const action = new CategoriesUpdateAction(test.action);
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
