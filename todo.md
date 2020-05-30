# To-Do
- [ ] allow syncing indexedDB with Google Drive SpreadSheet
    I want to build something similar to
    https://github.com/alexishevia/redux-file-sync
    but I want to use a Google SpreadSheet as the cloud file, and I want to use an indexedDB for localStorage
    see: `./src/redux/gdrive/sync.js`
    see: `./docs/gdrive_sync.md`
- [ ] think about how to detect change of rules versions
- [ ] replace `localDb.getTransactionsCursor()` with a better abstraction
- [ ] add lock to prevent multiple sync operations running at the same time
- [ ] allow creating "Income" transactions
- [ ] allow editing transactions
- [ ] add prettier
- [ ] display the full path to Google Spreadsheet file in `Sync` screen
