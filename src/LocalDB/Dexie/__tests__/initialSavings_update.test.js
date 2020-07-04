import { v4 as uuidv4 } from "uuid";
import { InitialSavingsUpdateAction } from "../../../redux/actionCreators";
import LocalDB from "..";

/* --- test start --- */

describe("initialSavings/update", () => {
  const tests = [
    {
      name: "initial savings is set up correctly",
      payload: 100,
      expect: {
        initialSavings: 100,
        actionsCount: 1,
        lastAction: 100,
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
        const action = new InitialSavingsUpdateAction(test.payload);
        await localDB.processActions([action]);

        // run assertions
        const got = await localDB.getInitialSavings();
        expect(got).toBe(test.expect.initialSavings);

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
