import { actions as errActions } from "../errors";
import getLocalDB from "../../LocalDB/get";
import setLocalDB from "../../LocalDB/set";
import { actions as localDBActions } from "../../redux/localDB";
import getCloudReplica from "../../CloudReplica/get";
import GoogleSpreadsheet from "../../AppendOnlyLog/GoogleSpreadsheet";
import syncRecursive from "../../sync";
import { selectors as gSelectors } from "../gdrive";

// --- thunk creators --- //

let syncLock; // prevents running multiple instances of runSync() concurrently

// runSync syncs LocalDB and AppendOnlyLog
export function runSync() {
  return async function syncThunk(dispatch, getState) {
    const state = getState();
    const file = gSelectors.getFile(state);
    if (!file || !file.id) {
      dispatch(errActions.add("Tried running sync without a file selected."));
      return;
    }
    if (syncLock) {
      console.warn("Sync is already running.");
      return;
    }
    try {
      syncLock = true;
      const newLocalDB = await syncRecursive({
        localDB: await getLocalDB(),
        cloudReplica: await getCloudReplica(),
        appendOnlyLog: new GoogleSpreadsheet({ spreadsheetId: file.id }),
        newLocalDB: () => getLocalDB({ forceNew: true }),
      });
      setLocalDB(newLocalDB);
      syncLock = false;
      dispatch(localDBActions.load());
    } catch (err) {
      syncLock = false;
      console.error(err);
      dispatch(errActions.add("Sync failed: " + err.message));
    }
  };
}
