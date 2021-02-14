# Sync to Google Drive Spreadsheet

This app works as a stand-alone application. Once the code is loaded, it can
work completely offline, storing data locally in indexedDB.

It also allows syncing the indexedDB data to a [Google Drive spreadsheet](https://developers.google.com/sheets/api/).

However, it takes a rather "unique" approach to syncing.

## Overview

Instead of trying to map indexedDB concepts directly to the spreadsheet, the app treats the spreadsheet as an append-only log file.

See [Using logs to build a solid data infrastructure](http://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html) for reference.

Essentially, the app keeps appending new "actions" to the spreadsheet, one action per row.

Each action is a JSON string that describes an operation. See [Redux actions](https://redux.js.org/basics/actions/) for reference.

An invoice-zero spreadsheet might look something like this:

|     | A                                                                                                           | B   | C   |
| --- | ----------------------------------------------------------------------------------------------------------- | --- | --- |
| 1   | { "version": "1", "type": "transfers/put", "payload": { "amount": 200, "category": "Health", ... } }        |     |     |
| 2   | { "version": "1", "type": "transfers/put", "payload": { "amount": 137.63, "category": "Groceries", ... } }  |     |     |
| 3   | { "version": "1", "type": "transfers/put", "payload": { "amount": 28.07, "category": "Restaurants", ... } } |     |     |

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

The "cloudReplica" only processes events from the Google spreadsheet.

It is used for performance reasons, to avoid having to re-download and re-process the spreadsheet multiple times.

### Local DBs

At any given time, there can be one or more "local" databases in indexedDB.

These databases are called `<version>_local_<N>`, where:

- `<version>` is the version of rules used when the database was created
- `<N>` is an auto-incrementing number.
  eg: `v1_local_0`, `v1_local_1`, `v1_local_2`, ..., `vN_local_N`

Whenever the app runs, it connects to the "active" local DB.
Note: `localStorage.activeLocalDB` keeps track of the local DB that is considered "active". If no `localStorage.activeLocalDB` exists, a new local DB must be generated as described in the "Generating a new local DB" section.

Local DBs process local events immediately, without waiting for them to be uploaded to the Google spreadsheet (offline first).

### Generating a new local DB

To generate a new local DB:

1. Generate a new `<version>_local_<N>` indexedDB database, where:
   - `<version>` should be the version of rules the app is currently running.
   - `<N>` should be the current `<N>` + 1.  
     Note: If `<version>_local_<N+1>` DB exists, try `<version>_local_<N+2>`, `<version>_local_<N+3>`, etc. until an unused name is found.
2. Copy all items from `cloudReplica` into the new local DB.
3. For every item in the "active" localDB's `localActions` table:
   - Process the action as described in the "Processing Actions" section (including copying actions to the `localActions` store).  
     Note: this step will only be necessary if actions are created while the new local DB is being generated. My guess is that generating a new local DB should be fast enough that it won't give the user a chance to generate new actions.
4. Update `localStorage.activeLocalDB` to match the name that was picked in step #1.
5. To free up space, old local DBs should be deleted.

### Processing Actions

When a new action is generated, the following happens in the current "local" DB:

1. The action is added to `localDB.localActions`.
2. The action is processed (the corresponding table/item is created/updated/deleted)
3. The `localDB.meta.actionsCount` is increased by `1`.
4. The `localDB.meta.lastAction` value is updated to match the action that was processed.

Note: if there is no active local DB, a new local DB must be generated as described in the "Generating a new local DB" section.

### Sync Strategy

1. updateCloudReplica()
   Download rows (actions) from Google Spreadsheet, where `row index > cloudReplica.actions.count()`.
   For every action downloaded:
   - process the action in `cloudReplica`
2. uploadLocalActions()
   If there are any `localDB.localActions`:
   - upload them (ie: append) to the Google spreadsheet
   - delete them from `localDB.actions`, then proceed to step #1
     If there are no `localDB.actions`, proceed to step #3.
3. checkConflicts()
   - If local DB is in sync with cloudReplica, sync is done.
   - Otherwise, local DB is in conflict, and a new local DB must be generated (as described in the "Generating a new local DB" section).
     The following rules must BOTH be true to consider cloudReplica and local DB to be in sync:
   1. `cloudReplica.actions.count() == localDB.meta.actionsCount`
   2. `localDB.meta.lastAction === last action found in cloudReplica.actions`
