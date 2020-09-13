import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import AccountsChart from "./AccountsChart";
import TransactionsList from "../../TransactionsList";
import useAsyncState from "../../hooks/useAsyncState";

export default function Home({ coreApp }) {
  const [accounts, reloadAccounts] = useAsyncState(
    [],
    async function* loadAccounts() {
      try {
        const allAccounts = await coreApp.getAccounts();
        yield allAccounts;
        const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
          "balance",
          "monthlyWithdrawals",
        ]);
        yield extendedAccounts;
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  const [categories, reloadCategories] = useAsyncState(
    [],
    function* loadCategories() {
      try {
        yield coreApp.getCategories();
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  const [recentTransactions, reloadRecentTransactions] = useAsyncState(
    [],
    function* loadRecentTransactions() {
      try {
        yield coreApp.getTransactions({
          orderBy: "modifiedAt",
          reverse: true,
          limit: 15,
        });
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  useEffect(() => {
    function reloadData() {
      reloadAccounts();
      reloadCategories();
      reloadRecentTransactions();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
    CHANGE_EVENT: PropTypes.string.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getTransactions: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
