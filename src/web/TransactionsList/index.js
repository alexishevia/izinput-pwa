import React from "react";
import PropTypes from "prop-types";
import { IonList } from "@ionic/react";
import Expense from "../Expense";
import Income from "../Income";
import Transfer from "../Transfer";

import "./TransactionsList.css";

function TransactionsList({ transactions, accounts, categories }) {
  if (!transactions.length) {
    return null;
  }

  return (
    <IonList className="TransactionsList">
      {transactions.map((transaction) => {
        switch (transaction.type) {
          case "INCOME":
            return (
              <Income
                key={transaction.id}
                income={transaction}
                accounts={accounts}
                categories={categories}
              />
            );
          case "EXPENSE":
            return (
              <Expense
                key={transaction.id}
                expense={transaction}
                accounts={accounts}
                categories={categories}
              />
            );
          case "TRANSFER":
            return (
              <Transfer
                key={transaction.id}
                transfer={transaction}
                accounts={accounts}
                categories={categories}
              />
            );
          default:
            console.warn(`Transaction with unknown type: ${transaction.type}`);
            return null;
        }
      })}
    </IonList>
  );
}

TransactionsList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TransactionsList;
