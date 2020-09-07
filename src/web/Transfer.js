import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonNote } from "@ionic/react";

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

export default function Transfer({ transfer, accounts }) {
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
