# To-Do

- [ ] switch from idb to dexie

      - switch application code to use LocalDB.dexie and CloudReplica.dexie
      - create an `AppendOnlyLog.google` implementation
          I can probably copy some functions to download/upload to google from `src/redux/gdrive/sync.js`
          I just need to expose the same interface as `src/AppendOnlyLog.memory`
      - switch application code to use sync/sync.js instead of gdrive/sync.js
          (will probably need to add some redux dispatches somewhere)
      - remove `idb` from dependencies when done
      - remove old LocalDB, old CloudReplica, and old gdrive/sync.js

- [ ] find an way to automatically get rid of all the `*.sqlite` files that get generated when running tests
- [ ] add tests for gdrive sync
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
