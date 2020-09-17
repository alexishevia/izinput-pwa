import React from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

const initialDataMax = 1000;

// round a number up to the nearest thousand
// eg: toNearestThousand(1350.82) => 2000
function toNearestThousand(n) {
  if (n < 1000) {
    return 1000;
  }
  const [val] = `${n}`.split("."); // get rid of decimals
  const result = val
    .split("")
    .reverse()
    .map((num, i) => {
      if (i < 3) {
        return 0;
      } // set ones, tens, and hundreds to 0
      if (i === 3) {
        return parseInt(num, 10) + 1;
      } // add 1 to the thousands
      return num; // keep anything above thousands intact
    })
    .reverse()
    .join("");
  return parseInt(result, 10);
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
  // graphData is an object with format:
  // {
  //   dataMax,
  //   byMonth: [
  //      { name, income, expenses }
  //   ]
  // }
  // eg:
  // {
  //   dataMax: 6000,
  //   byMonth: [
  //     { name: "2019-09", income: 5200.15, expenses: 4892.01 },
  //     ...
  //   ]
  // }
  const [graphData] = useAsyncState(
    { dataMax: initialDataMax, byMont: [] },
    async function* loadGraphData() {
      try {
        const months = getLastMonths(13).map((date) => ({
          name: getMonthStrFromDate(date),
          fromDate: dateToDayStr(monthStart(date)),
          toDate: dateToDayStr(monthEnd(date)),
        }));

        let result = {
          dataMax: initialDataMax,
          byMonth: months.map(({ name }) => ({ name, income: 0, expenses: 0 })),
        };
        yield result;

        /* eslint no-restricted-syntax: [0] */
        for (const month of months.sort(sortByName).reverse()) {
          const { name: monthName, fromDate, toDate } = month;
          const [income, expenses] = await Promise.all([
            coreApp.getTotalDeposits({ fromDate, toDate }),
            coreApp.getTotalWithdrawals({ fromDate, toDate }),
          ]);
          const monthMax = income > expenses ? income : expenses;
          result = {
            dataMax:
              monthMax > result.dataMax
                ? toNearestThousand(monthMax)
                : result.dataMax,
            byMonth: result.byMonth.map((data) =>
              data.name === monthName ? { ...data, income, expenses } : data
            ),
          };
          yield result;
        }
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );
  return (
    <>
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Income Vs Expenses</h2>
        </IonLabel>
      </IonItem>
      <ResponsiveContainer className="AccountsChart" width="100%" height={300}>
        <BarChart data={graphData.byMonth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis type="number" domain={[0, graphData.dataMax]} />
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
