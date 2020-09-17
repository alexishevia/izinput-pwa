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

const initialDataMax = 1000;

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

export default function ExpensesByMonth({ coreApp }) {
  // expenses is an object with format:
  // {
  //   dataMax,
  //   byCategory: {
  //    [categoryName]: { month, expenses }
  //   }
  // }
  //
  // eg:
  // {
  //   dataMax: 5000,
  //   byCategory: {
  //     "Restaurantes": [
  //       { month: "2019-09", expenses: 4892.01 },
  //       { month: "2019-10", expenses: 3501.85 },
  //       ...
  //     ]
  //  }
  // }
  //
  // NOTE: `dataMax` keeps track of the highest value across all categories.
  // This helps us render all graphs using the same scale.
  const [expenses] = useAsyncState(
    { dataMax: initialDataMax, byCategory: [] },
    async function* loadExpenses() {
      try {
        const months = getLastMonths(13).map((date) => ({
          name: getMonthStrFromDate(date),
          fromDate: dateToDayStr(monthStart(date)),
          toDate: dateToDayStr(monthEnd(date)),
        }));
        const categories = (await coreApp.getCategories()).sort(sortByName);
        let result = {
          dataMax: initialDataMax,
          byCategory: categories.reduce(
            (memo, cat) => ({
              ...memo,
              [cat.name]: months.map((month) => ({
                month: month.name,
                expenses: 0,
              })),
            }),
            {}
          ),
        };
        yield result;
        /* eslint no-restricted-syntax:[0] */
        for (const cat of categories) {
          for (const month of months.sort(sortByName).reverse()) {
            const withdrawals = await coreApp.getTotalWithdrawals({
              categoryIDs: [cat.id],
              fromDate: month.fromDate,
              toDate: month.toDate,
            });
            result = {
              dataMax:
                withdrawals > result.dataMax
                  ? toNearestThousand(withdrawals)
                  : result.dataMax,
              byCategory: {
                ...result.byCategory,
                [cat.name]: result.byCategory[cat.name].map((data) =>
                  data.month === month.name
                    ? { ...data, expenses: withdrawals }
                    : data
                ),
              },
            };
            yield result;
          }
        }
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );
  return (
    <>
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Expenses By Month</h2>
        </IonLabel>
      </IonItem>
      {Object.entries(expenses.byCategory).map(([name, graphData]) => (
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
              <YAxis domain={[0, expenses.dataMax]} />
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
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
