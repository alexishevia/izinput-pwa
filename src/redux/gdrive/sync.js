import { get } from 'lodash'
import { getFile } from './selectors'
import { actions as errActions } from '../errors';

function getCells(props) {
  return new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.get(props)
    .then(resolve, reject)
  ));
}

function appendCells(params, valueRangeBody) {
  return new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
    .then(resolve, reject)
  ));
}

async function downloadFile(file) {
  try {
    const response = await getCells({ spreadsheetId: file.id, range: 'A1:A5' });
    const values = get(response, 'result.values', []);
    console.log(values);
  } catch (err) {
    throw err;
  }
}

async function uploadPending(file) {
  const params = {
    spreadsheetId: file.id,
    range: 'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
  };

  const valueRangeBody = {
    majorDimension: "ROWS",
    values: [
      ["hello"],
      ["world"],
      ["foo"],
      ["bar"],
    ],
  };

  try {
    const response = await appendCells(params, valueRangeBody);
    console.log(response);
  } catch (err) {
    throw err;
  }
}


// sync is a thunk creator
export default function sync() {
  return async function syncThunk(dispatch, getState) {
    const state = getState();
    const file = getFile(state);

    if (!file || !file.id) {
      dispatch(errActions.add('Tried running sync without a file selected.'));
      return;
    }

    // TODO: implement sync correctly

    // uploadPending()
    // - read entries in idb.localN.localActions
    // - append entries to gdrive
    // - delete entries from idb.localN.localActions

    // downloadCloudFile()
    // - create idb.cloudReplica if it does not exist
    //    * NOTE: if idb.cloudReplica.metadata.version does not match the current reducerVersion, it means
    //    we need to completely discard idb.cloudReplica and build a new one
    // - download any rows from gdrive where rowNum > idb.cloudReplica.metadata.latestRow
    // - write entries to idb.cloudReplica
    //    * update idb.cloudReplica.metadata.latestRow
    //    * update idb.cloudReplica.metadata.lastUpdate
    //    * update idb.cloudReplica.metadata.lastUpdate

    // await uploadPending(file)
    // await downloadFile(file);
  }
}

