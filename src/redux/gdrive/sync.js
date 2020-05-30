import { get } from 'lodash'
import { getFile } from './selectors'
import getCloudReplica from '../../CloudReplica/get';
import { actions as errActions } from '../errors';

async function getActions({ spreadsheetId, from, to }) {
  const range = `A${from}:${to}`; // eg: 'A1:A21'
  const response = await new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range })
    .then(resolve, reject)
  ))
  return get(response, 'result.values', []).map(row => row[0]);
}

function appendCells(params, valueRangeBody) {
  return new Promise((resolve, reject) => (
    window.gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
    .then(resolve, reject)
  ));
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

async function updateCloudReplica({ cloudReplica, spreadsheetId }) {
  const lastKnownIndex = await cloudReplica.getLastIndex();
  const from = lastKnownIndex || 1; // always re-download the last index
  const actions = await getActions({ spreadsheetId, from, to: from + 25 });
  if (!actions || actions.length <= 1) {
    console.log('cloudReplica is up to date');
    return;
  }
  await cloudReplica.append({ actions, from });
  return updateCloudReplica({ cloudReplica, spreadsheetId });
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

    try {
      const cloudReplica = await getCloudReplica();
      await updateCloudReplica({ cloudReplica, spreadsheetId: file.id })
    } catch(err) {
      console.error(err);
      dispatch(errActions.add('Failed to download data from Google Spreadsheet.'));
      return;
    }

    // TODO: finish sync implementation
  }
}

