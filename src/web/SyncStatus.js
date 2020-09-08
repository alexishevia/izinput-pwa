import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonIcon } from "@ionic/react";
import {
  checkmarkDoneOutline,
  syncOutline,
  alertCircleOutline,
} from "ionicons/icons";

const RUNNING = "RUNNING";
const SUCCESS = "SUCCESS";
const ERROR = "ERROR";

export default function SyncStatus({ coreApp }) {
  const [syncStatus, setSyncStatus] = useState(SUCCESS);
  const [lastSuccessDate, setLastSuccessDate] = useState(null);
  const [lastErrorMsg, setLastErrorMsg] = useState(null);

  function onSyncStart() {
    setSyncStatus(RUNNING);
  }

  function onSyncError(errMsg) {
    setLastErrorMsg(errMsg);
    setSyncStatus(ERROR);
  }

  function onSyncSuccess() {
    setLastSuccessDate(new Date().toLocaleTimeString());
    setSyncStatus(SUCCESS);
  }

  function getIcon() {
    switch (syncStatus) {
      case RUNNING:
        return syncOutline;
      case SUCCESS:
        return checkmarkDoneOutline;
      default:
        return alertCircleOutline;
    }
  }

  function getMsg() {
    switch (syncStatus) {
      case RUNNING:
        return "Sync is running";
      case SUCCESS:
        return lastSuccessDate ? `Last synced: ${lastSuccessDate}` : "";
      case ERROR:
        return `Sync failed: ${lastErrorMsg}`;
      default:
        return "";
    }
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

  function onClick(evt) {
    evt.preventDefault();
    const msg = getMsg();
    if (msg) {
      coreApp.newError(msg);
    }
  }

  return <IonIcon icon={getIcon()} onClick={onClick} />;
}

SyncStatus.propTypes = {
  coreApp: PropTypes.shape({
    SYNC_START_EVENT: PropTypes.string.isRequired,
    SYNC_SUCCESS_EVENT: PropTypes.string.isRequired,
    SYNC_ERROR_EVENT: PropTypes.string.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    runSync: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
