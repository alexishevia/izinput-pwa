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

function getTotal(obj) {
  return Object.values(obj).reduce((memo, val) => memo + val, 0);
}

export default function ExpensesByMonth({ expensesByCategory }) {
  let dataMax = 1000;
  Object.values(expensesByCategory).forEach((byMonth) => {
    Object.values(byMonth).forEach((val) => {
      if (val > dataMax) {
        dataMax = toNearestThousand(val);
      }
    });
  });

  const totalsByCategory = Object.entries(expensesByCategory).reduce(
    (memo, [categoryName, values]) => ({
      ...memo,
      [categoryName]: getTotal(values),
    }),
    {}
  );

  const categoryNamesSortedByTotal = Object.keys(expensesByCategory).sort(
    (catA, catB) => totalsByCategory[catB] - totalsByCategory[catA]
  );

  return (
    <>
      {categoryNamesSortedByTotal.map((name) => {
        const graphData = Object.entries(
          expensesByCategory[name]
        ).map(([month, expenses]) => ({ month, expenses }));
        return (
          <div key={name}>
            <IonItem style={{ marginBottom: "1rem" }}>
              <IonLabel>
                <h3>{name}</h3>
                <p>Total: ${totalsByCategory[name].toLocaleString()}</p>
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
                <YAxis domain={[0, dataMax]} />
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
        );
      })}
    </>
  );
}

ExpensesByMonth.propTypes = {
  expensesByCategory: PropTypes.shape({}).isRequired,
};
