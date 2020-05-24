# Sync to Google Drive Spreadsheet
This app works as an offline-first application, storing data in indexedDB.

It also allows syncing the indexedDB data to a Google Drive spreadsheet.

However, it takes a rather "unique" approach to syncing.

## Overview
Instead of trying to map indexedDB concepts directly to the spreadsheet, the app treats the spreadsheet as an append-only log file.

See [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html) for reference.

Essentially, the app keeps appending new "actions" to the spreadsheet, one action per row.

Each action is a JSON string that describes a data-modifying operation. See [Redux actions](https://redux.js.org/basics/actions/) for reference.

If you were building a to-do app, your spreadsheet might look something like this:

  | A                                                                                   | B | C
------------------------------------------------------------------------------------------------
1 | { "version": 1, "type": "add_todo", "payload": { "id": 1, "text": "take out milk" } |   |
2 | { "version": 1, "type": "add_todo", "payload": { "id": 2, "text": "feed the dogs" } |   |
3 | { "version": 1, "type": "check_todo", "payload": { "id": 1 }                        |   |

The core ideas behind this sync strategy are:
1. The spreadsheet works like an append-only log. Actions are appended to the spreadsheet, one action per row. Modifying or deleting rows is not allowed. Append is the only valid operation.
2. The set of rules that define how actions must be processed are well-defined and strictly versioned. Every action includes a "version" field to inform which version of rules was being used when the action was generated.
3. If two or more applications process actions from the same spreadsheet, and are running the same version of rules, they must eventually end up in the same state.
4. The spreadsheet is the source of truth. Apps can store actions locally (eg: in indexedDB), but actions are not considered "final" until they are uploaded to the spreadsheet.

## Implementation Details
This app keeps two "types" of indexedDB databases:
- a single "cloudReplica" db
- multiple "local" dbs

### Cloud Replica
The "cloudReplica" database has two stores:
- actions
    Every google spreadsheet row is kept as a document in `cloudReplica.actions`.
- meta
    Keeps track of the last known spreadsheet state.

### Local Dbs
At any given time, there are one or more "local" databases in indexedDb.

These databases are called "local<N>", where `<N>` is an auto-incrementing number.
eg: `local0`, `local1`, `local2`, ..., `localN`

Whenever the app runs, it reads/writes data to the most-recent "local" db (the one with the highest `<N>` value).

### Processing Actions
When a new action is generated, the following happens in the current "local" db:
1. The action is added to `localN.actions`.
2. `localN.meta.lastIndex` is increased by 1.
3. The action's ID is written to `localN.meta.lastActionID`.
4. If a financial transaction is added/modified/deleted, the corresponding change is reflected in `localN.transactions`.
5. If a financial category is added/modified/deleted, the corresponding change is reflected in `localN.categories`

### Sync Strategy
1. updateCloudReplica()
    Download rows (actions) from Google Spreadsheet, where `row index > cloudReplica.meta.lastIndex`.
    For every action downloaded:
    * add the action to `cloudReplica.actions`
    * write the row's index to `cloudReplica.meta.lastIndex`
    * write the action's id to `cloudReplica.meta.lastActionID`
    * if the action's "version" is greater than `cloudReplica.meta.latestVersion`, update `cloudReplica.meta.latestVersion` to match.
2. updateAppVersion()
    If the app is running a version of rules lower than `cloudReplica.meta.latestVersion`, update the app before moving on with next steps.
3. uploadPending()
    If there are any `localN.actions`:
        * upload them (ie: append) to the google spreadsheet
        * delete them from `localN.actions`
        * proceed to step #1
    If there are no `localN.actions`, proceed to step #4.
4. checkConflicts()
    - If local db is in sync with cloudReplica, sync is done.
    - Otherwise, local db is in conflict, and you need to proceed to step #5.
    The following rules must ALL be true to consider cloudReplica and local db to be in sync:
    1. `cloudReplica.meta.lastIndex == localN.meta.lastIndex`
    2. `cloudReplica.meta.lastActionID == localN.meta.lastActionID`
5. tmpDB()
    Generate a new `tmpDB` database.
    Note: If a `tmpDB` exists, it can be reused. In that case, only *new* cloudReplica rows (relative to tmpDB) need to be processed.
    For every action in `cloudReplica.actions`:
    * Process the action, and execute changes on `tmpDB` (NOT on `localDB`)
6. uploadPending()
    While the `tmpDB` was being updated, new actions could have been generated in the local database.
    * If there are any `localN.actions`, proceed to step #3.
    * Otherwise, proceed to step #7.
7. switchLocalDB()
    Rename `tmpDB` to `local<N>`, with `<N>` being the next integer after the current localN.
    Then, have the app read/write from this new localN.
