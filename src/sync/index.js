import { get } from 'lodash'


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

async function sync({ file }) {
  if (!file || !file.id) {
    console.warn('tried running sync without providing a file. File:', file);
    return;
  }

  // await uploadPending(file)
  // await downloadFile(file);
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

export default sync
