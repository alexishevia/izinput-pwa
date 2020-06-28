import { v4 as uuidv4 } from "uuid";
import { InitialSavingsUpdateAction } from "../../actionCreators";
import LocalDB from "../LocalDB";

/* --- test start --- */

describe("initialSavings/update", () => {
  const tests = [
    {
      name: "initial savings is set up correctly",
      payload: 100,
      expect: 100,
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
        const action = new InitialSavingsUpdateAction(test.payload);
        await localDB.processActions([action]);

        // run assertions
        const got = await localDB.getInitialSavings();
        expect(got).toBe(test.expect);
      } catch (err) {
        if (localDB) {
          localDB.deleteDB();
        } // cleanup
        throw err;
      }
    });
  });
});
