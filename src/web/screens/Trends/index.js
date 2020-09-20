import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { chevronBackOutline, filterOutline } from "ionicons/icons";
import useAsyncState from "../../hooks/useAsyncState";
import AccountsFilter from "../../Filters/AccountsFilter";
import CategoriesFilter from "../../Filters/CategoriesFilter";
import DateFilter from "../../Filters/DateFilter";
import IncomeVsExpenses from "./IncomeVsExpenses";
import ExpensesByMonth from "./ExpensesByMonth";
import {
  addMonths,
  dateToDayStr,
  getMonthStrFromDate,
  monthEnd,
  monthStart,
  substractMonths,
} from "../../../helpers/date";

function getMonthsInRange(startDate, endDate) {
  const months = [];
  let date = monthStart(endDate);
  while (date >= startDate) {
    months.push({
      name: getMonthStrFromDate(date),
      fromDate: dateToDayStr(monthStart(date)),
      toDate: dateToDayStr(monthEnd(date)),
    });
    date = addMonths(date, -1);
  }
  return months.reverse();
}

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

export default function Trends({ coreApp }) {
  const today = new Date();
  const [fromDate, setFromDate] = useState(
    dateToDayStr(substractMonths(monthStart(today), 12))
  );
  const [toDate, setToDate] = useState(dateToDayStr(monthEnd(today)));
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // incomeByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const [incomeByMonth, setIncomeByMonth] = useState({});

  // expensesByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const [expensesByMonth, setExpensesByMonth] = useState({});

  // expensesByCategory is an object with format:
  // { [categoryName]: { [monthName]: expenses } }
  // eg:
  // {
  //   "Restaurantes": { "2019-09": 4892.01, "2019-10": 3501.85, ... },
  //     ...
  // }
  const [expensesByCategory, setExpensesByCategory] = useState({});

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

  const [accountsStatus, setAccountsStatus] = useState({});

  function setStatusForAccount(id, isActive) {
    setAccountsStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function getActiveAccounts() {
    return (accounts || [])
      .filter(({ id }) => (accountsStatus || {})[id] !== false)
      .map((acc) => acc.id);
  }

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

  const [categoriesStatus, setCategoriesStatus] = useState({});

  function setStatusForCategory(id, isActive) {
    setCategoriesStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function getActiveCategories() {
    return (categories || [])
      .filter(({ id }) => (categoriesStatus || {})[id] !== false)
      .map((cat) => cat.id);
  }

  function handleOpenFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(true);
  }

  function handleCloseFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(false);
  }

  function loadGraphData() {
    const months = getMonthsInRange(new Date(fromDate), new Date(toDate));
    const monthsObj = months.reduce(
      (memo, { name }) => ({
        ...memo,
        [name]: 0,
      }),
      {}
    );

    const incomeByMonthResult = { ...monthsObj };
    const expensesByMonthResult = { ...monthsObj };
    const expensesByCategoryResult = {};

    setIncomeByMonth(incomeByMonthResult);
    setExpensesByMonth(expensesByMonthResult);

    const activeAccounts = getActiveAccounts();
    const activeCategories = getActiveCategories();

    let cancelled = false;

    function iterateThroughIncomes(localDB) {
      return localDB.dexie.incomes
        .filter(
          ({ deleted, transactionDate, accountID, categoryID }) =>
            !deleted &&
            fromDate <= transactionDate &&
            transactionDate <= toDate &&
            activeAccounts.includes(accountID) &&
            activeCategories.includes(categoryID)
        )
        .until(() => cancelled)
        .each(({ transactionDate, amount }) => {
          const month = transactionDate.substr(0, 7);
          incomeByMonthResult[month] += amount;
        });
    }

    function iterateThroughExpenses(localDB) {
      return localDB.dexie.expenses
        .filter(
          ({ deleted, transactionDate, accountID, categoryID }) =>
            !deleted &&
            fromDate <= transactionDate &&
            transactionDate <= toDate &&
            activeAccounts.includes(accountID) &&
            activeCategories.includes(categoryID)
        )
        .until(() => cancelled)
        .each(({ transactionDate, amount, categoryID }) => {
          const month = transactionDate.substr(0, 7);
          expensesByMonthResult[month] += amount;

          const category = categories.find((cat) => cat.id === categoryID);
          const categoryName =
            category && category.name ? category.name : "No Category";
          if (!expensesByCategoryResult[categoryName]) {
            expensesByCategoryResult[categoryName] = { ...monthsObj };
          }
          expensesByCategoryResult[categoryName][month] += amount;
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
        ]);
      })
      .then(() => {
        if (cancelled) {
          return;
        }
        setIncomeByMonth(
          Object.entries(incomeByMonthResult).reduce(
            (memo, [month, val]) => ({
              ...memo,
              [month]: asMoneyFloat(val),
            }),
            {}
          )
        );
        setExpensesByMonth(
          Object.entries(expensesByMonthResult).reduce(
            (memo, [month, val]) => ({
              ...memo,
              [month]: asMoneyFloat(val),
            }),
            {}
          )
        );
        setExpensesByCategory(
          Object.entries(expensesByCategoryResult).reduce(
            (memo, [categoryName, values]) => ({
              ...memo,
              [categoryName]: Object.entries(values).reduce(
                (agg, [month, val]) => ({
                  ...agg,
                  [month]: asMoneyFloat(val),
                }),
                {}
              ),
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
      reloadCategories();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload graph data when filters change
  useEffect(() => {
    const cancel = loadGraphData();
    return () => {
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromDate,
    toDate,
    accounts,
    accountsStatus,
    categories,
    categoriesStatus,
  ]);

  return (
    <>
      <IonModal
        isOpen={isFiltersModalOpen}
        onDidDismiss={() => setIsFiltersModalOpen(false)}
      >
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleCloseFiltersModal}>
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Filters</IonTitle>
        </IonToolbar>
        <IonContent>
          <IonList>
            <DateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
            <AccountsFilter
              accounts={accounts}
              accountsStatus={accountsStatus}
              setStatusForAccount={setStatusForAccount}
            />
            <CategoriesFilter
              categories={categories}
              categoriesStatus={categoriesStatus}
              setStatusForCategory={setStatusForCategory}
            />
          </IonList>
        </IonContent>
      </IonModal>
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Income Vs Expenses</h2>
        </IonLabel>
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      <IncomeVsExpenses
        incomeByMonth={incomeByMonth}
        expensesByMonth={expensesByMonth}
      />
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Expenses By Month</h2>
        </IonLabel>
      </IonItem>
      <ExpensesByMonth expensesByCategory={expensesByCategory} />
    </>
  );
}

Trends.propTypes = {
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
