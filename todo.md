# To-Do
- [ ] create app that writes to indexedDB
    I am already opening a db connection on: `src/redux/idb`
    Now I need to connect `src/components/DBWriter` with this store to detect when it is ready, and start writing to it
- [ ] allow syncing indexedDB with Google Drive SpreadSheet
    I want to build something similar to
    https://github.com/alexishevia/redux-file-sync
    but I want to use a Google SpreadSheet as the cloud file, and I want to use an indexedDB for localStorage
