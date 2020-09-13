import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonNote } from "@ionic/react";

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

function getCategoryName(categories, id) {
  const category = categories.find((cat) => cat.id === id);
  return category && category.name ? category.name : "";
}

export default function Income({ income, accounts, categories }) {
  const {
    id,
    amount,
    description,
    transactionDate,
    accountID,
    categoryID,
  } = income;
  const accountLabel = getAccountName(accounts, accountID);
  const categoryLabel = getCategoryName(categories, categoryID);

  return (
    <IonItem
      className="TransactionsListItem"
      button
      routerLink={`/editIncome/${id}`}
    >
      <IonLabel>
        <p>
          <IonNote color="success">${amount.toFixed(2)}</IonNote>
          <br />
          {categoryLabel} =&gt; {accountLabel}
          <br />
          <span className="TransactionsListItemDate">{transactionDate}</span>
          {description}
        </p>
      </IonLabel>
    </IonItem>
  );
}

Income.propTypes = {
  income: PropTypes.shape({
    id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    transactionDate: PropTypes.string.isRequired,
    accountID: PropTypes.string.isRequired,
    categoryID: PropTypes.string.isRequired,
  }).isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
