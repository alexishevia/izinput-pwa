import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel, IonNote } from "@ionic/react";

import "./TransfersList.css";

function sortByModifiedAt(a, b) {
  if (a.modifiedAt > b.modifiedAt) {
    return -1;
  }
  if (b.modifiedAt > a.modifiedAt) {
    return 1;
  }
  return 0;
}

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

function FormattedAmount({ type, amount }) {
  const color =
    {
      EXPENSE: "danger",
      INCOME: "success",
    }[type] || "dark";
  return <IonNote color={color}>${amount.toFixed(2)}</IonNote>;
}

FormattedAmount.propTypes = {
  amount: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

function getTransactionType(coreApp, accounts, transaction) {
  if (coreApp.isExpense(transaction, accounts)) {
    return "EXPENSE";
  }
  if (coreApp.isIncome(transaction, accounts)) {
    return "INCOME";
  }
  return "";
}

function TransfersList({ coreApp, transfers, accounts }) {
  if (!transfers.length) {
    return null;
  }

  function transactionType(transaction) {
    return getTransactionType(coreApp, accounts, transaction);
  }

  return (
    <IonList className="TransfersList">
      {transfers.sort(sortByModifiedAt).map((transaction) => {
        const { id, amount, description, transferDate, from, to } = transaction;
        const fromLabel = getAccountName(accounts, from);
        const toLabel = getAccountName(accounts, to);

        return (
          <IonItem
            className="TransfersListItem"
            key={id}
            button
            routerLink={`/editTransfer/${id}`}
          >
            <IonLabel>
              <p>
                <FormattedAmount
                  amount={amount}
                  type={transactionType(transaction)}
                />
                <br />
                {fromLabel} =&gt; {toLabel}
                <br />
                <span className="TransfersListItemDate">{transferDate}</span>
                {description}
              </p>
            </IonLabel>
          </IonItem>
        );
      })}
    </IonList>
  );
}

TransfersList.propTypes = {
  coreApp: PropTypes.shape({
    isExpense: PropTypes.func.isRequired,
  }).isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  transfers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      transferDate: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TransfersList;
