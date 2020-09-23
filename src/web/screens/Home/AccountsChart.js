import React from "react";
import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./AccountsChart.css";

const minHeight = 100;

export default function AccountsChart({ accounts }) {
  if (!accounts || !accounts.length) {
    return null;
  }

  const height = accounts.length * 50;

  return (
    <ResponsiveContainer
      className="AccountsChart"
      width="100%"
      height={height < minHeight ? minHeight : height}
    >
      <BarChart data={accounts} layout="vertical">
        <XAxis type="number" domain={[0, "dataMax"]} hide />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Bar stackId="a" dataKey="balance" fill="#82ca9d" />
        <Bar
          stackId="a"
          dataKey="monthlyExpenses"
          name="expenses (this month)"
          fill="#EF666D"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

AccountsChart.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      balance: PropTypes.number,
      monthlyExpenses: PropTypes.number,
    })
  ).isRequired,
};
