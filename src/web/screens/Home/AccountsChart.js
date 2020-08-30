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

export default function AccountsChart({ accounts }) {
  if (!accounts || !accounts.length) {
    return null;
  }

  return (
    <ResponsiveContainer
      className="AccountsChart"
      width="100%"
      height={accounts.length * 50}
    >
      <BarChart data={accounts} layout="vertical">
        <XAxis type="number" domain={[0, "dataMax"]} hide />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Bar stackId="a" dataKey="balance" fill="#82ca9d" />
        <Bar
          stackId="a"
          dataKey="monthlyWithdrawals"
          name="monthly withdrawals"
          fill="rgb(200, 37, 44)"
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
      monthlyWithdrawals: PropTypes.number,
    })
  ).isRequired,
};
