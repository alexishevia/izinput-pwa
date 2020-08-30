import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import AccountsChart from "./AccountsChart";
import TransfersList from "../../Transfers/TransfersList";
import EditTransfer from "../../Transfers/EditTransfer";
import { dateToDayStr } from "../../../helpers/date";

const now = new Date();
const monthStart = dateToDayStr(new Date(now.getFullYear(), now.getMonth(), 1));
const monthEnd = dateToDayStr(
  new Date(now.getFullYear(), now.getMonth() + 1, 0)
);

function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

function getBalances(coreApp, accounts) {
  return Promise.all(
    accounts.map((account) => coreApp.getAccountBalance(account.id))
  );
}

function getWithdrawals(coreApp, accounts) {
  return Promise.all(
    accounts.map((account) =>
      coreApp.getTotalWithdrawals({
        id: account.id,
        fromDate: monthStart,
        toDate: monthEnd,
      })
    )
  );
}

export default function Home({ coreApp, accounts, onError }) {
  const [internalAccounts, setInternalAccounts] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function loadInternalAccounts() {
      try {
        const intAccounts = accounts.filter(
          (account) => account.type === "INTERNAL"
        );
        const [balances, withdrawals] = await Promise.all([
          getBalances(coreApp, intAccounts),
          getWithdrawals(coreApp, intAccounts),
        ]);
        setInternalAccounts(
          intAccounts.map((account, i) => ({
            ...account,
            balance: asMoneyFloat(balances[i]),
            monthlyWithdrawals: asMoneyFloat(withdrawals[i]),
          }))
        );
      } catch (err) {
        onError(err);
      }
    }
    coreApp.on(coreApp.CHANGE_EVENT, loadInternalAccounts);
    loadInternalAccounts();
    return () => {
      coreApp.off(coreApp.CHANGE_EVENT, loadInternalAccounts);
    };
  }, []);

  useEffect(() => {
    async function loadRecentTransfers() {
      try {
        const transfers = await coreApp.getRecentTransfers();
        setRecentTransfers(transfers);
      } catch (err) {
        onError(err);
      }
    }
    coreApp.on(coreApp.CHANGE_EVENT, loadRecentTransfers);
    loadRecentTransfers();
    return () => {
      coreApp.off(coreApp.CHANGE_EVENT, loadRecentTransfers);
    };
  }, []);

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
      onError(err);
    }
  }

  async function handleDeleteTransfer(id) {
    try {
      setEditing(null);
      await coreApp.deleteTransfer(id);
    } catch (err) {
      onError(err);
    }
  }

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <AccountsChart accounts={internalAccounts} />
      <IonItem>
        <IonLabel>
          <h3>Recent Transfers</h3>
        </IonLabel>
      </IonItem>
      <TransfersList
        transfers={recentTransfers}
        accounts={accounts}
        onSelectTransfer={(id) => setEditing(id)}
      />
      {transferToEdit ? (
        <EditTransfer
          transfer={transferToEdit}
          editTransfer={handleEditTransfer}
          accounts={accounts}
          onDelete={() => handleDeleteTransfer(transferToEdit.id)}
          onCancel={() => setEditing(null)}
          onError={onError}
        />
      ) : null}
    </>
  );
}

Home.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    deleteTransfer: PropTypes.func.isRequired,
    getRecentTransfers: PropTypes.func.isRequired,
    getTotalWithdrawals: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    updateTransfer: PropTypes.func.isRequired,
  }).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onError: PropTypes.func.isRequired,
};
