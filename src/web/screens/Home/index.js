import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import AccountsChart from "./AccountsChart";
import TransfersList from "../../Transfers/TransfersList";
import EditTransfer from "../../Transfers/EditTransfer";
import useErrors from "../../hooks/useErrors";
import Errors from "../../Errors";

function isInternal(account) {
  return account.type === "INTERNAL";
}

function isExternal(account) {
  return !isInternal(account);
}

export default function Home({ coreApp }) {
  const [accounts, setAccounts] = useState(null);
  const [recentTransfers, setRecentTransfers] = useState(null);
  const [editing, setEditing] = useState(null);
  const [errors, addError, dismissErrors] = useErrors([]);

  useEffect(() => {
    if (accounts !== null) {
      return;
    }
    async function loadAccounts() {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);

        const externalAccounts = allAccounts.filter(isExternal);
        let internalAccounts = allAccounts.filter(isInternal);

        // extend internalAccounts with commonly used fields
        internalAccounts = await coreApp.extendAccounts(internalAccounts, [
          "balance",
          "monthlyWithdrawals",
        ]);

        setAccounts([...internalAccounts, ...externalAccounts]);
      } catch (err) {
        addError(err);
      }
    }
    loadAccounts();
  });

  useEffect(() => {
    if (recentTransfers !== null) {
      return;
    }
    async function loadRecentTransfers() {
      try {
        const transfers = await coreApp.getRecentTransfers();
        setRecentTransfers(transfers);
      } catch (err) {
        addError(err);
      }
    }
    loadRecentTransfers();
  });

  let transferToEdit;
  if (editing) {
    transferToEdit = recentTransfers.find(
      (transfer) => transfer.id === editing
    );
  }

  async function handleEditTransfer(transferData) {
    try {
      await coreApp.updateTransfer(transferData);
      setEditing(null);
    } catch (err) {
      addError(err);
    }
  }

  async function handleDeleteTransfer(id) {
    try {
      setEditing(null);
      await coreApp.deleteTransfer(id);
    } catch (err) {
      addError(err);
    }
  }

  return (
    <>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      {accounts ? (
        <AccountsChart accounts={accounts.filter(isInternal)} />
      ) : null}
      <IonItem>
        <IonLabel>
          <h3>Recent Transfers</h3>
        </IonLabel>
      </IonItem>
      <TransfersList
        transfers={recentTransfers || []}
        accounts={accounts || []}
        onSelectTransfer={(id) => setEditing(id)}
      />
      {transferToEdit ? (
        <EditTransfer
          transfer={transferToEdit}
          editTransfer={handleEditTransfer}
          accounts={accounts || []}
          onDelete={() => handleDeleteTransfer(transferToEdit.id)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}

Home.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    deleteTransfer: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getRecentTransfers: PropTypes.func.isRequired,
    getTotalWithdrawals: PropTypes.func.isRequired,
    updateTransfer: PropTypes.func.isRequired,
  }).isRequired,
};
