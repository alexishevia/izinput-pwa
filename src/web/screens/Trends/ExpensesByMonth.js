import React from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import {
  CartesianGrid,
  Line,
  LineChart,
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

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export default function ExpensesByMonth({ coreApp }) {
  // expenses is an object with format:
  // { [categoryName]: { month, expenses } }
  //
  // eg:
  // {
  //   "Restaurantes": [
  //     { month: "2019-09", expenses: 4892.01 },
  //     { month: "2019-10", expenses: 3501.85 },
  //     ...
  //   ]
  // }
  const [expenses] = useAsyncState({}, async function* loadExpenses() {
    const months = getLastMonths(13).map((date) => ({
      name: getMonthStrFromDate(date),
      fromDate: dateToDayStr(monthStart(date)),
      toDate: dateToDayStr(monthEnd(date)),
    }));
    const categories = (await coreApp.getCategories()).sort(sortByName);
    let result = categories.reduce(
      (memo, cat) => ({
        ...memo,
        [cat.name]: months.map((month) => ({ month: month.name, expenses: 0 })),
      }),
      {}
    );
    yield result;
    /* eslint no-restricted-syntax:[0] */
    for (const cat of categories) {
      for (const month of months) {
        const withdrawals = await coreApp.getTotalWithdrawals({
          categoryIDs: [cat.id],
          fromDate: month.fromDate,
          toDate: month.toDate,
        });
        result = {
          ...result,
          [cat.name]: result[cat.name].map((data) =>
            data.month === month.name
              ? { ...data, expenses: withdrawals }
              : data
          ),
        };
        yield result;
      }
    }
  });
  return (
    <>
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Expenses By Month</h2>
        </IonLabel>
      </IonItem>
      {Object.entries(expenses).map(([name, graphData]) => (
        <div key={name}>
          <IonItem style={{ marginBottom: "1rem" }}>
            <IonLabel>
              <h3>{name}</h3>
            </IonLabel>
          </IonItem>
          <ResponsiveContainer
            className="AccountsChart"
            width="100%"
            height={300}
          >
            <LineChart
              width={500}
              height={300}
              data={graphData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8884d8"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </>
  );
}

ExpensesByMonth.propTypes = {
  coreApp: PropTypes.shape({
    getCategories: PropTypes.func.isRequired,
    getTotalWithdrawals: PropTypes.func.isRequired,
  }).isRequired,
};
