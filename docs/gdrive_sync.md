# Sync to Google Drive Spreadsheet
This app works as an offline-first application, storing data in indexedDB.

It also allows syncing the indexedDB data to a Google Drive spreadsheet.

However, it takes a rather "unique" approach to syncing.

## Overview
Instead of trying to map indexedDB concepts directly to the spreadsheet, the app treats the spreadsheet as an append-only log file.

See [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html) for reference.

Essentially, the app keeps appending new "actions" to the spreadsheet, one action per row.

Each action is a JSON string that describes an operation. See [Redux actions](https://redux.js.org/basics/actions/) for reference.

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
- one or more "local" dbs

### Cloud Replica
The "cloudReplica" database has two stores:
- actions
    Every action from the Google spreadsheet is downloaded to `cloudReplica.actions`.
- meta
    Keeps track of the last known spreadsheet state. Some of the documents found in this store are:
    * latestVersion: keeps track of the highest "version" number found in the Google spreadsheet actions.

### Local Dbs
At any given time, there can be one or more "local" databases in indexedDb.

These databases are called "local<N>", where `<N>` is an auto-incrementing number.
eg: `local0`, `local1`, `local2`, ..., `localN`

Whenever the app runs, it connects to the "active" local db.
    Note: `localStorage.activeLocalDB` keeps track of the local db that is considered "active". If no `localStorage.activeLocalDB` exists, a new local DB must be generated as described in the "Generating a new local DB" section.

Local Dbs have the following stores:
- localActions
    Actions that have been created locally, but not yet uploaded to the Google Spreadsheet.
- meta
    Keeps track of current database state. Some of the documents found in this store are:
    * lastIndex: last index (aka row number) that was processed.
    * lastAction: the last action (the full string) that was processed.
    * version: the rules "version" that was used for generating this db.
- transactions
    Financial transactions that have been processed by the app.
- categories
    Financial categories that have been processed by the app.

### Generating a new local DB
To generate a new local db:
1. Generate a new `local<N>` indexedDB database, where `<N>` should be the current `<N>` + 1.
    Note: If `local<N+1>` DB exists, try `local<N+2>`, `local<N+3>`, etc. until an unused name is found.
2. Set the `meta.version` value to match the app's rules version.
3. For every action found in `cloudReplica.actions`:
    * Process the action as described in the "Processing Actions" section, with the exception that the action should NOT be added to the `localActions` store.
4. For every action found in the "active" localDB:
    * Process the action as described in the "Processing Actions" section (including copying actions to the `localActions` store).
    Note: this step will only be necessary if new actions are created while the local db is being generated. My guess is that generating a new local db should be fast enough that it won't give the user a chance to generate new actions.
5. Update `localStorage.activeLocalDB` to match the name that was picked in step #1.
6. To free up space, old local DBs should be deleted.

### Processing Actions
When a new action is generated, the following happens in the current "local" db:
1. The action is added to `localDB.localActions`.
2. If a financial transaction is added/modified/deleted, the corresponding change is reflected in `localDB.transactions`.
3. If a financial category is added/modified/deleted, the corresponding change is reflected in `localDB.categories`

Note: if there is no active local db, a new local db must be generated as described in the "Generating a new local DB" section.

### Sync Strategy
1. updateCloudReplica()
    Download rows (actions) from Google Spreadsheet, where `row index > cloudReplica.actions.count()`.
    For every action downloaded:
    * add the action to `cloudReplica.actions`
    * if the action's "version" is greater than `cloudReplica.meta.latestVersion`, update `cloudReplica.meta.latestVersion` to match.
2. uploadPending()
    If there are any `localDB.localActions`:
        * upload them (ie: append) to the Google spreadsheet
        * delete them from `localDB.actions`
        * proceed to step #1
    If there are no `localDB.actions`, proceed to step #3.
3. checkConflicts()
    - If local db is in sync with cloudReplica, sync is done.
    - Otherwise, local db is in conflict, and a new local db must be generated (as described in the "Generating a new local DB" section).
    The following rules must ALL be true to consider cloudReplica and local db to be in sync:
    1. `cloudReplica.actions.count() == localDB.meta.lastIndex`
    2. `localDB.meta.lastAction === last action found in cloudReplica.actions`
    3. `localDB.meta.version` is lower than the app's rules version
    Note: If the app is running a version of rules lower than `cloudReplica.meta.latestVersion`, try forcing an app update.
