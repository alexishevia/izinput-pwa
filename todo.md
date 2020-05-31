# To-Do
- [ ] allow syncing indexedDB with Google Drive SpreadSheet
    I want to build something similar to
    https://github.com/alexishevia/redux-file-sync
    but I want to use a Google SpreadSheet as the cloud file, and I want to use an indexedDB for localStorage
    see: `./src/redux/gdrive/sync.js`
    see: `./docs/gdrive_sync.md`

    * when creating a new database, make sure to copy `localActions` from old database to new database.
    * make sure to delete old databases
    * after sync is done, if changes were made, make sure to dispatch an event so redux reloads data from new local database
- [ ] only display latest transactions in the Transactions screen
- [ ] think about how to detect change of rules versions
- [ ] add recursive limit
    wherever a recursive function is being used, add a counter and exit if counter goes above acceptable number
- [ ] add lock to prevent multiple sync operations running at the same time
- [ ] allow creating "Income" transactions
- [ ] allow editing transactions
- [ ] add prettier
- [ ] display the full path to Google Spreadsheet file in `Sync` screen
