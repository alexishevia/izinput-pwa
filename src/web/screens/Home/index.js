import React from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import AccountsChart from "./AccountsChart";
import TransactionsList from "../../TransactionsList";
import useErrors from "../../hooks/useErrors";
import useCoreAppData from "../../hooks/useCoreAppData";
import Errors from "../../Errors";

export default function Home({ coreApp }) {
  const [errors, addError, dismissErrors] = useErrors([]);

  const [accounts] = useCoreAppData({
    coreApp,
    initialValue: [],
    dataLoadFunc: async (setAccounts) => {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);
        const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
          "balance",
          "monthlyWithdrawals",
        ]);
        setAccounts(extendedAccounts);
      } catch (err) {
        addError(err);
      }
    },
  });

  const [categories] = useCoreAppData({
    coreApp,
    initialValue: [],
    dataLoadFunc: async (setCategories) => {
      try {
        const allCategories = await coreApp.getCategories();
        setCategories(allCategories);
      } catch (err) {
        addError(err);
      }
    },
  });

  const [recentTransactions] = useCoreAppData({
    coreApp,
    initialValue: [],
    dataLoadFunc: async (setRecentTransactions) => {
      try {
        const transactions = await coreApp.getRecentTransactions();
        setRecentTransactions(transactions);
      } catch (err) {
        addError(err);
      }
    },
  });

  return (
    <>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <AccountsChart accounts={accounts} />
      <IonItem>
        <IonLabel>
          <h3>Recent Transactions</h3>
        </IonLabel>
      </IonItem>
      <TransactionsList
        transactions={recentTransactions}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}

Home.propTypes = {
  coreApp: PropTypes.shape({
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getRecentTransactions: PropTypes.func.isRequired,
  }).isRequired,
};
