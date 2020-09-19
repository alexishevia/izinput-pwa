import React from "react";
import PropTypes from "prop-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export default function IncomeVsExpenses({ incomeByMonth, expensesByMonth }) {
  const dataMax = [
    ...Object.values(incomeByMonth),
    ...Object.values(expensesByMonth),
  ].reduce(
    (prevMax, monthMax) =>
      monthMax > prevMax ? toNearestThousand(monthMax) : prevMax,
    1000
  );

  const byMonth = Object.keys(incomeByMonth).map((month) => ({
    name: month,
    income: incomeByMonth[month],
    expenses: expensesByMonth[month],
  }));

  return (
    <ResponsiveContainer className="AccountsChart" width="100%" height={300}>
      <BarChart data={byMonth}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis type="number" domain={[0, dataMax]} />
        <Tooltip />
        <Bar dataKey="income" fill="#82ca9d" />
        <Bar dataKey="expenses" fill="#EF666D" />
      </BarChart>
    </ResponsiveContainer>
  );
}

IncomeVsExpenses.propTypes = {
  incomeByMonth: PropTypes.shape({}).isRequired,
  expensesByMonth: PropTypes.shape({}).isRequired,
};
