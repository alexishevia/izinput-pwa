# To-Do

- [ ] switch from idb to dexie

      - see: https://dexie.org/docs/Tutorial/Design
      - remove idb from dependencies when done
      - I'm writing tests for all dexie-based implementations. see: `./src/LocalDB.dexie/__tests__`
      - missing action: `initialSavings/update`
      - implement sync using dexie

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
