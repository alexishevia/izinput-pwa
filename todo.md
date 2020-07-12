# To-Do

- [ ] add tests for "transfers" actions
- [ ] remove all references to "categories", "transactions", and "initialBalance"
- [ ] get rid of circular dependencies
      create a middleware that runs `localDB/actions#load()` automatically after:
  - a transaction is created/updated/deleted
  - sync is done running
    instead of having to call it manually
- [ ] make sure `npm run lint` does not throw errors
- [ ] find an way to automatically get rid of all the `*.sqlite` files that get generated when running tests
- [ ] allow editing categories
- [ ] add indicator to show when sync is running/failed/done
- [ ] run sync.js when app is loaded, or after a transaction is added
- [ ] only display latest transactions in the Transactions screen
- [ ] allow creating "Income" transactions
- [ ] allow editing transactions
- [ ] display the full path to Google Spreadsheet file in `Sync` screen
- [ ] think about how to detect change of rules versions
- [ ] add recursive limit
      wherever a recursive function is being used, add a counter and exit if counter goes above acceptable number
