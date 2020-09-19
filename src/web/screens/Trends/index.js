import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
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

function getLastMonths(n) {
  const today = new Date();
  let date = substractMonths(today, n - 1);
  const result = [];
  while (date <= today) {
    result.push(date);
    date = addMonths(date, 1);
  }
  return result;
}

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

export default function Trends({ coreApp }) {
  // incomeByMonth is an array with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const [incomeByMonth, setIncomeByMonth] = useState({});

  // expensesByMonth is an array with format:
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

  useEffect(() => {
    const months = getLastMonths(13).map((date) => ({
      name: getMonthStrFromDate(date),
      fromDate: dateToDayStr(monthStart(date)),
      toDate: dateToDayStr(monthEnd(date)),
    }));
    const { fromDate } = months[0];
    const { toDate } = months[months.length - 1];
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

    let cancelled = false;

    function iterateThroughIncomes(localDB) {
      return localDB.dexie.incomes
        .filter(
          ({ transactionDate }) =>
            fromDate <= transactionDate && transactionDate <= toDate
        )
        .until(() => cancelled)
        .each(({ transactionDate, amount }) => {
          const month = transactionDate.substr(0, 7);
          incomeByMonthResult[month] += amount;
        });
    }

    function iterateThroughExpenses(localDB, categories) {
      return localDB.dexie.expenses
        .filter(
          ({ transactionDate }) =>
            fromDate <= transactionDate && transactionDate <= toDate
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

    function loadData() {
      return Promise.all([coreApp.getLocalDB(), coreApp.getCategories()])
        .then(([localDB, categories]) =>
          Promise.all([
            iterateThroughIncomes(localDB),
            iterateThroughExpenses(localDB, categories),
          ])
        )
        .then(() => {
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
          coreApp.newError(err);
        });
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <IncomeVsExpenses
        incomeByMonth={incomeByMonth}
        expensesByMonth={expensesByMonth}
      />
      <ExpensesByMonth expensesByCategory={expensesByCategory} />
    </>
  );
}

Trends.propTypes = {
  coreApp: PropTypes.shape({
    getCategories: PropTypes.func.isRequired,
    getLocalDB: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
