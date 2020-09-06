import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel, IonNote } from "@ionic/react";
import Expense from "../Expense";
import Income from "../Income";

import "./TransactionsList.css";

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

function Transfer({ transfer, accounts }) {
  const { id, amount, description, transactionDate, fromID, toID } = transfer;
  const fromLabel = getAccountName(accounts, fromID);
  const toLabel = getAccountName(accounts, toID);

  return (
    <IonItem
      className="TransactionsListItem"
      button
      routerLink={`/editTransfer/${id}`}
    >
      <IonLabel>
        <p>
          <IonNote color="tertiary">${amount.toFixed(2)}</IonNote>
          <br />
          {fromLabel} =&gt; {toLabel}
          <br />
          <span className="TransactionsListItemDate">{transactionDate}</span>
          {description}
        </p>
      </IonLabel>
    </IonItem>
  );
}

Transfer.propTypes = {
  transfer: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    fromID: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    toID: PropTypes.string.isRequired,
    transactionDate: PropTypes.string.isRequired,
  }).isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

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
