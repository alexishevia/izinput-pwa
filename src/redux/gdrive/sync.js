import { get } from 'lodash'
import { getFile } from './selectors'
import getCloudReplica from '../../CloudReplica/get';
import getLocalDB from '../../LocalDB/get';
import { actions as errActions } from '../errors';
import { PAGE_SIZE } from '../../constants';

async function getActionsFromSpreadsheet({ spreadsheetId, from, to }) {
  const range = `A${from}:${to}`; // eg: 'A1:A21'
  const response = await new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range })
    .then(resolve, reject)
  ))
  return get(response, 'result.values', []).map(row => row[0]);
}

async function uploadActionsToSpreadsheet({ spreadsheetId, actions }) {
  const params = {
    spreadsheetId: spreadsheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
  };
  const valueRangeBody = {
    majorDimension: "ROWS",
    values: actions.map(action => [action]),
  };
  return new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
    .then(resolve, reject)
  ));
}

async function updateCloudReplicaRecursive({ cloudReplica, spreadsheetId }) {
  const lastKnownIndex = await cloudReplica.getActionsCount();
  const from = lastKnownIndex || 1; // always re-download the last index
  const actions = await getActionsFromSpreadsheet({ spreadsheetId, from, to: from + PAGE_SIZE });
  if (!actions || actions.length <= 1) {
    console.log('cloudReplica is up to date.');
    return;
  }
  await cloudReplica.append({ actions, from });
  return updateCloudReplicaRecursive({ cloudReplica, spreadsheetId });
}

async function uploadLocalActionsRecursive({ localDB, spreadsheetId, uploadCount = 0 }) {
  const actions = await localDB.getLocalActions({ from: 0, to: PAGE_SIZE });
  if (!actions || !actions.length) {
    return uploadCount; // done
  }
  await uploadActionsToSpreadsheet({ spreadsheetId, actions });
  await localDB.deleteLocalActions({ from: 0, to: actions.length - 1 });
  return uploadLocalActionsRecursive({
    localDB,
    spreadsheetId,
    uploadCount: uploadCount + actions.length
  });
}

async function syncRecursive({ dispatch, spreadsheetId, cloudReplica, localDB }) {
    // update cloud replica
    try {
      await updateCloudReplicaRecursive({ cloudReplica, spreadsheetId });
    } catch(err) {
      console.error(err);
      dispatch(errActions.add('Failed to download data from Google Spreadsheet.'));
      return;
    }

    // upload local actions
    try {
      const uploadCount = await uploadLocalActionsRecursive({ spreadsheetId, localDB })
      if (uploadCount > 0) {
        console.log('Total localActions uploaded:', uploadCount);
        return syncRecursive({ dispatch, spreadsheetId, cloudReplica, localDB })
      }
      console.log('All localActions have been uploaded.');
    } catch(err) {
      console.error(err);
      dispatch(errActions.add('Failed to upload local data to Google Spreadsheet.'));
      return;
    }

    // TODO: finish sync implementation
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
    const cloudReplica = await getCloudReplica();
    const localDB = await getLocalDB();
    await syncRecursive({
      dispatch,
      spreadsheetId: file.id,
      cloudReplica,
      localDB,
    });
  }
}

