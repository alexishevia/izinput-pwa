import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel } from "@ionic/react";

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

function FormattedAmount({ amount }) {
  const prefix = amount < 0 ? "-" : "";
  return `${prefix} $${amount.toFixed(2)}`;
}

function TransfersList({ transfers, accounts, onSelectTransfer }) {
  if (!transfers.length) {
    return null;
  }

  return (
    <IonList>
      {transfers
        .sort(sortByModifiedAt)
        .map(({ id, amount, description, transferDate, from, to }) => {
          const fromLabel = getAccountName(accounts, from);
          const toLabel = getAccountName(accounts, to);

          return (
            <IonItem key={id} button onClick={() => onSelectTransfer(id)}>
              <IonLabel>
                <p>
                  <FormattedAmount amount={amount} />
                  <br />
                  {fromLabel} =&gt; {toLabel}
                  <br />
                  {description} {transferDate}
                </p>
              </IonLabel>
            </IonItem>
          );
        })}
    </IonList>
  );
}

TransfersList.propTypes = {
  onSelectTransfer: PropTypes.func.isRequired,
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
