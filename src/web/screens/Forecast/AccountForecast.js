import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonInput } from "@ionic/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { addMonths } from "../../../helpers/date";

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

export default function AccountForecast({
  name,
  balance,
  avgDeposits,
  avgWithdrawals,
}) {
  const [balanceOverride, setBalanceOverride] = useState("");
  const [avgDepositsOverride, setAvgDepositsOverride] = useState("");
  const [avgWithdrawalsOverride, setAvgWithdrawalsOverride] = useState("");
  const [months, setMonths] = useState(12);

  const balanceVal = parseFloat(
    balanceOverride === "" ? balance : balanceOverride,
    10
  );
  const avgDepositsVal = parseFloat(
    avgDepositsOverride === "" ? avgDeposits : avgDepositsOverride,
    10
  );
  const avgWithdrawalsVal = parseFloat(
    avgWithdrawalsOverride === "" ? avgWithdrawals : avgWithdrawalsOverride,
    10
  );

  const today = new Date();
  let isGraphDataOK = true;
  const graphData = [
    {
      month: today.toISOString().substr(0, 7),
      amount: asMoneyFloat(balanceVal),
    },
  ];
  for (let i = 0; i < months - 1; i += 1) {
    const newVal = asMoneyFloat(
      graphData[i].amount + avgDepositsVal - avgWithdrawalsVal
    );
    if (Number.isNaN(newVal)) {
      isGraphDataOK = false;
    }
    graphData.push({
      month: addMonths(today, i + 1)
        .toISOString()
        .substr(0, 7),
      amount: newVal,
    });
  }

  function handleSubmit(evt) {
    evt.preventDefault();
  }

  return (
    <>
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h3>{name}</h3>
        </IonLabel>
      </IonItem>
      {isGraphDataOK ? (
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
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
      <form onSubmit={handleSubmit}>
        <IonItem>
          <IonLabel position="stacked">Available Money:</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            value={balanceVal}
            onIonChange={(evt) => {
              setBalanceOverride(evt.detail.value);
            }}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Avg Monthly Deposits:</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            value={avgDepositsVal}
            onIonChange={(evt) => {
              setAvgDepositsOverride(evt.detail.value);
            }}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Avg Monthly Withdrawals:</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            value={avgWithdrawalsVal}
            onIonChange={(evt) => {
              setAvgWithdrawalsOverride(evt.detail.value);
            }}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Projection (months):</IonLabel>
          <IonInput
            type="number"
            step="1"
            value={months}
            onIonChange={(evt) => {
              setMonths(evt.detail.value);
            }}
          />
        </IonItem>
      </form>
    </>
  );
}

AccountForecast.propTypes = {
  name: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  avgDeposits: PropTypes.number.isRequired,
  avgWithdrawals: PropTypes.number.isRequired,
};
