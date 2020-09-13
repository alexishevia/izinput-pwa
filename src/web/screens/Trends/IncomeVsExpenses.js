import React from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useAsyncState from "../../hooks/useAsyncState";
import {
  addMonths,
  getMonthStrFromDate,
  monthEnd,
  monthStart,
  substractMonths,
  dateToDayStr,
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

export default function IncomeVsExpenses({ coreApp }) {
  // graphData is an array of objects, where each object has format:
  // { name, income, expenses }
  //
  // eg:
  // [
  //   { name: "2019-09", income: 5200.15, expenses: 4892.01 },
  //   ...
  // ]
  const [graphData] = useAsyncState([], async function* loadGraphData() {
    try {
      const dates = getLastMonths(13);
      yield dates.map((date) => ({
        name: getMonthStrFromDate(date),
        income: 0,
        expenses: 0,
      }));
      const values = await Promise.all(
        dates.map(async (date) => {
          const name = getMonthStrFromDate(date);
          const fromDate = dateToDayStr(monthStart(date));
          const toDate = dateToDayStr(monthEnd(date));
          const [income, expenses] = await Promise.all([
            coreApp.getTotalDeposits({ fromDate, toDate }),
            coreApp.getTotalWithdrawals({ fromDate, toDate }),
          ]);
          return { name, income, expenses };
        })
      );
      yield values;
    } catch (err) {
      coreApp.newError(err);
    }
  });
  return (
    <>
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h3>Income Vs Expenses</h3>
        </IonLabel>
      </IonItem>
      <ResponsiveContainer className="AccountsChart" width="100%" height={300}>
        <BarChart data={graphData}>
          <XAxis dataKey="name" />
          <YAxis type="number" domain={[0, "dataMax"]} />
          <Tooltip />
          <Bar dataKey="income" fill="#82ca9d" />
          <Bar dataKey="expenses" fill="#EF666D" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

IncomeVsExpenses.propTypes = {
  coreApp: PropTypes.shape({
    getTotalDeposits: PropTypes.func.isRequired,
    getTotalWithdrawals: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
