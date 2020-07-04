import get from "lodash/get";

export default function GoogleSpreadsheet({ spreadsheetId }) {
  async function getActions({ from, to }) {
    const range = `A${from}:${to}`; // eg: 'A1:A21'
    const response = await new Promise((resolve, reject) => {
      return window.gapi.client.sheets.spreadsheets.values
        .get({ spreadsheetId, range })
        .then(resolve, reject);
    });
    return get(response, "result.values", []).map((row) => row[0]);
  }

  async function appendActions(actions) {
    const params = {
      spreadsheetId: spreadsheetId,
      range: "A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
    };
    const valueRangeBody = {
      majorDimension: "ROWS",
      values: actions.map((action) => [action]),
    };
    return new Promise((resolve, reject) =>
      window.gapi.client.sheets.spreadsheets.values
        .append(params, valueRangeBody)
        .then(resolve, reject)
    );
  }

  return {
    getActions,
    appendActions,
  };
}
