import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel } from "@ionic/react";

export default function SyncStatus({ coreApp }) {
  const [isSyncRunning, setIsSyncRunning] = useState(false);

  function onSyncStart() {
    setIsSyncRunning(true);
  }

  function onSyncError() {
    setIsSyncRunning(false);
  }

  function onSyncSuccess() {
    setIsSyncRunning(false);
  }

  useEffect(() => {
    coreApp.on(coreApp.SYNC_START_EVENT, onSyncStart);
    coreApp.on(coreApp.SYNC_ERROR_EVENT, onSyncError);
    coreApp.on(coreApp.SYNC_SUCCESS_EVENT, onSyncSuccess);
    coreApp.runSync();
    return () => {
      coreApp.off(coreApp.SYNC_START_EVENT, onSyncStart);
      coreApp.off(coreApp.SYNC_ERROR_EVENT, onSyncError);
      coreApp.off(coreApp.SYNC_SUCCESS_EVENT, onSyncSuccess);
    };
  }, []);

  return (
    <IonLabel slot="fixed" style={{ bottom: 0 }}>
      {isSyncRunning ? (
        <div style={{ backgroundColor: "#eee" }}>syncing...</div>
      ) : (
        <div>&nbsp;</div>
      )}
    </IonLabel>
  );
}

SyncStatus.propTypes = {
  coreApp: PropTypes.shape({
    SYNC_START_EVENT: PropTypes.string.isRequired,
    SYNC_SUCCESS_EVENT: PropTypes.string.isRequired,
    SYNC_ERROR_EVENT: PropTypes.string.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    runSync: PropTypes.func.isRequired,
  }).isRequired,
};
