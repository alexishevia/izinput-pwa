# To-Do

- [ ] switch from idb to dexie

  - get app running with new implemenation.
    I tried hooking everything up, but there are some errors thrown when trying to create a transaction.
    Need to do some debugging to figure out what is going on.

    transaction actions are being created without an ID

- [ ] run sync.js when app is loaded, or after a transaction is added
- [ ] make sure `npm run lint` does not throw errors
- [ ] find an way to automatically get rid of all the `*.sqlite` files that get generated when running tests
- [ ] display categories
- [ ] only display latest transactions in the Transactions screen
- [ ] after sync is done, if changes were made, make sure to dispatch an event so redux reloads data from new local database
- [ ] think about how to detect change of rules versions
- [ ] add recursive limit
      wherever a recursive function is being used, add a counter and exit if counter goes above acceptable number
- [ ] add lock to prevent multiple sync operations running at the same time
- [ ] allow creating "Income" transactions
- [ ] allow editing transactions
- [ ] display the full path to Google Spreadsheet file in `Sync` screen
- [ ] add unit tests, specially for sync
