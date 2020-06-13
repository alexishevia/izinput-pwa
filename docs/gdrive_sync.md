# Sync to Google Drive Spreadsheet
This app works as an offline-first application, storing data in indexedDB.

It also allows syncing the indexedDB data to a Google Drive spreadsheet.

However, it takes a rather "unique" approach to syncing.

## Overview
Instead of trying to map indexedDB concepts directly to the spreadsheet, the app treats the spreadsheet as an append-only log file.

See [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html) for reference.

Essentially, the app keeps appending new "actions" to the spreadsheet, one action per row.

Each action is a JSON string that describes an operation. See [Redux actions](https://redux.js.org/basics/actions/) for reference.

An invoice-zero spreadsheet might look something like this:

| | A                                                                                                              | B | C
--|----------------------------------------------------------------------------------------------------------------|---|--
1 | { "version": "1", "type": "transactions/put", "payload": { "amount": 200, "category": "Health", ... } }        |   |
2 | { "version": "1", "type": "transactions/put", "payload": { "amount": 137.63, "category": "Groceries", ... } }  |   |
3 | { "version": "1", "type": "transactions/put", "payload": { "amount": 28.07, "category": "Restaurants", ... } } |   |

The core ideas behind this sync strategy are:
1. The spreadsheet works like an append-only log.
    Actions are appended to the spreadsheet, one action per row. Modifying or deleting rows is not allowed. Append is the only valid operation.
2. Rules are versioned.
    There must be a set of rules that define how actions must be processed. These rules must be well-defined and strictly versioned. Every action must include a "version" field to inform which version of rules was being used when the action was generated.
3. Eventual consistency.
    If two or more applications process actions from the same spreadsheet, and are running the same rules, they must eventually end up in the same state.
4. The spreadsheet is the source of truth.
    Apps can store actions locally (eg: in indexedDB), but actions are not considered "final" until they are uploaded to the spreadsheet.

## Implementation Details
This app keeps two "types" of indexedDB databases:
- a single "cloudReplica" DB
- one or more "local" DBs

### Cloud Replica
The "cloudReplica" database keeps a local copy of the Google spreadsheet.

It is used for performance reasons, to avoid having to re-download the spreadsheet multiple times.

The "cloudReplica" database has a single store:
- actions
    Every action from the Google spreadsheet is downloaded to `cloudReplica.actions`.

### Local DBs
At any given time, there can be one or more "local" databases in indexedDB.

These databases are called `<version>_local_<N>`, where:
- `<version>` is the version of rules used when the database was created
- `<N>` is an auto-incrementing number.
  eg: `v1_local_0`, `v1_local_1`, `v1_local_2`, ..., `vN_local_N`

Whenever the app runs, it connects to the "active" local DB.
    Note: `localStorage.activeLocalDB` keeps track of the local DB that is considered "active". If no `localStorage.activeLocalDB` exists, a new local DB must be generated as described in the "Generating a new local DB" section.

Local DBs have the following stores:
- localActions
    Actions that have been created locally, but not yet uploaded to the Google Spreadsheet.
- meta
    Keeps track of processing info, to be able to detect conflicts. Some of the documents found in this store are:
    * actionsCount: amount of actions that have been processed.
    * lastAction: the last action (the full string) that was processed.
- transactions
    Financial transactions that have been processed by the app.
- categories
    Financial categories that have been processed by the app.

### Generating a new local DB
To generate a new local DB:
1. Generate a new `<version>_local_<N>` indexedDB database, where:
    * `<version>` should be the version of rules the app is currently running.
    * `<N>` should be the current `<N>` + 1.
    Note: If `<version>_local_<N+1>` DB exists, try `<version>_local_<N+2>`, `<version>_local_<N+3>`, etc. until an unused name is found.
3. For every action found in `cloudReplica.actions`:
    * Process the action as described in the "Processing Actions" section, with the exception that the action should NOT be added to the `localActions` store.
    * NOTE: If the action has a version number higher than the app's rules version, then processing must be aborted and the app must be updated.
4. For every action found in the "active" localDB:
    * Process the action as described in the "Processing Actions" section (including copying actions to the `localActions` store).
    Note: this step will only be necessary if new actions are created while the local DB is being generated. My guess is that generating a new local DB should be fast enough that it won't give the user a chance to generate new actions.
5. Update `localStorage.activeLocalDB` to match the name that was picked in step #1.
6. To free up space, old local DBs should be deleted.

### Processing Actions
When a new action is generated, the following happens in the current "local" DB:
1. The action is added to `localDB.localActions`.
2. If a financial transaction is added/modified/deleted, the corresponding change is reflected in `localDB.transactions`.
3. If a financial category is added/modified/deleted, the corresponding change is reflected in `localDB.categories`
4. The `localDB.meta.actionsCount` value must be increased by `1`.
5. The `localDB.meta.lastAction` value should be updated to match the action being processed.

Note: if there is no active local DB, a new local DB must be generated as described in the "Generating a new local DB" section.

### Sync Strategy
1. updateCloudReplica()
    Download rows (actions) from Google Spreadsheet, where `row index > cloudReplica.actions.count()`.
    For every action downloaded:
    * add the action to `cloudReplica.actions`
    * if the action's "version" is greater than `cloudReplica.meta.latestVersion`, update `cloudReplica.meta.latestVersion` to match.
2. uploadLocalActions()
    If there are any `localDB.localActions`:
        * upload them (ie: append) to the Google spreadsheet
        * delete them from `localDB.actions`
        * proceed to step #1
    If there are no `localDB.actions`, proceed to step #3.
3. checkConflicts()
    - If local DB is in sync with cloudReplica, sync is done.
    - Otherwise, local DB is in conflict, and a new local DB must be generated (as described in the "Generating a new local DB" section).
    The following rules must BOTH be true to consider cloudReplica and local DB to be in sync:
    1. `cloudReplica.actions.count() == localDB.meta.actionsCount`
    2. `localDB.meta.lastAction === last action found in cloudReplica.actions`
