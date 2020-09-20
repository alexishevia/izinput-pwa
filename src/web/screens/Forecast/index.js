import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel } from "@ionic/react";
import useAsyncState from "../../hooks/useAsyncState";
import AccountForecast from "./AccountForecast";

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

function average(obj) {
  const total = Object.values(obj).reduce((memo, val) => memo + val, 0) * 1.0;
  return asMoneyFloat(total / Object.keys(obj).length);
}

export default function Forecast({ coreApp }) {
  const [accounts, reloadAccounts] = useAsyncState(
    [],
    function* loadAccounts() {
      try {
        yield coreApp.getAccounts();
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  // totalsByAccount is an object with format:
  // { [accountName]: { balance, avgDeposits, avgWithdrawals } }
  // eg:
  // {
  //   "Investments": { balance: 1520.43, avgDeposits: 1500, avgWithdrawals: 450.03 }
  //   ...
  // }
  const [totalsByAccount, setTotalsByAccount] = useState({});

  function loadTotals() {
    setTotalsByAccount(
      accounts.reduce(
        (memo, account) => ({
          ...memo,
          [account.name]: { balance: 0, avgDeposits: 0, avgWithdrawals: 0 },
        }),
        {}
      )
    );

    const accumulator = accounts.reduce(
      (memo, account) => ({
        ...memo,
        [account.name]: {
          balance: account.initialBalance,
          depositsByMonth: {},
          withdrawalsByMonth: {},
        },
      }),
      {}
    );

    let cancelled = false;

    function iterateThroughIncomes(localDB) {
      return localDB.dexie.incomes
        .filter(({ deleted }) => !deleted)
        .until(() => cancelled)
        .each(({ accountID, transactionDate, amount }) => {
          const account = accounts.find((acc) => acc.id === accountID);
          const accountName =
            account && account.name ? account.name : "No Account";
          if (!accumulator[accountName]) {
            accumulator[accountName] = {
              balance: 0,
              depositsByMonth: {},
              withdrawalsByMonth: {},
            };
          }
          accumulator[accountName].balance += amount;
          const month = transactionDate.substr(0, 7);
          if (!accumulator[accountName].depositsByMonth[month]) {
            accumulator[accountName].depositsByMonth[month] = 0;
          }
          accumulator[accountName].depositsByMonth[month] += amount;
        });
    }

    function iterateThroughExpenses(localDB) {
      return localDB.dexie.expenses
        .filter(({ deleted }) => !deleted)
        .until(() => cancelled)
        .each(({ accountID, transactionDate, amount }) => {
          const account = accounts.find((acc) => acc.id === accountID);
          const accountName =
            account && account.name ? account.name : "No Account";
          if (!accumulator[accountName]) {
            accumulator[accountName] = {
              balance: 0,
              depositsByMonth: {},
              withdrawalsByMonth: {},
            };
          }
          accumulator[accountName].balance -= amount;
          const month = transactionDate.substr(0, 7);
          if (!accumulator[accountName].withdrawalsByMonth[month]) {
            accumulator[accountName].withdrawalsByMonth[month] = 0;
          }
          accumulator[accountName].withdrawalsByMonth[month] += amount;
        });
    }

    function iterateThroughTransfers(localDB) {
      return localDB.dexie.transfers
        .filter(({ deleted }) => !deleted)
        .until(() => cancelled)
        .each(({ fromID, toID, transactionDate, amount }) => {
          const fromAccountName = (
            accounts.find((acc) => acc.id === fromID) || {}
          ).name;
          const toAccountName = (accounts.find((acc) => acc.id === toID) || {})
            .name;
          if (!fromAccountName) {
            console.warn(`transfer with unrecognized fromID: ${fromID}`);
            return;
          }
          if (!toAccountName) {
            console.warn(`transfer with unrecognized toID: ${toID}`);
            return;
          }
          accumulator[fromAccountName].balance -= amount;
          accumulator[toAccountName].balance += amount;
          const month = transactionDate.substr(0, 7);
          accumulator[fromAccountName].withdrawalsByMonth[month] += amount;
          accumulator[toAccountName].depositsByMonth[month] += amount;
        });
    }

    coreApp
      .getLocalDB()
      .then((localDB) => {
        if (cancelled) {
          return Promise.resolve([]);
        }
        return Promise.all([
          iterateThroughIncomes(localDB),
          iterateThroughExpenses(localDB),
          iterateThroughTransfers(localDB),
        ]);
      })
      .then(() => {
        if (cancelled) {
          return;
        }
        setTotalsByAccount(
          Object.entries(accumulator).reduce(
            (memo, [accountName, values]) => ({
              ...memo,
              [accountName]: {
                balance: asMoneyFloat(values.balance),
                avgDeposits: average(values.depositsByMonth),
                avgWithdrawals: average(values.withdrawalsByMonth),
              },
            }),
            {}
          )
        );
      })
      .catch((err) => {
        if (!cancelled) {
          coreApp.newError(err);
        }
      });

    return function cancel() {
      cancelled = true;
    };
  }

  // reload async data on coreApp.CHANGE_EVENT
  useEffect(() => {
    function reloadData() {
      reloadAccounts();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload transactions when accounts change
  useEffect(() => {
    const cancel = loadTotals();
    return () => {
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h2>Forecast</h2>
        </IonLabel>
      </IonItem>
      {Object.keys(totalsByAccount)
        .sort()
        .map((accountName) => {
          const { balance, avgDeposits, avgWithdrawals } = totalsByAccount[
            accountName
          ];
          return (
            <AccountForecast
              key={accountName}
              name={accountName}
              balance={balance}
              avgDeposits={avgDeposits}
              avgWithdrawals={avgWithdrawals}
            />
          );
        })}
    </>
  );
}

Forecast.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getLocalDB: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
  }).isRequired,
};
