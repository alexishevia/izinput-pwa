import React from "react";
import PropTypes from "prop-types";
import { IonList, IonListHeader, IonItem, IonLabel } from "@ionic/react";

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

function TransfersList({ transfers, accounts, onSelectTransfer }) {
  if (!transfers.length) {
    return null;
  }

  return (
    <IonList>
      <IonListHeader>
        <IonLabel>
          <h1>Transfers</h1>
        </IonLabel>
      </IonListHeader>
      {transfers
        .sort(sortByModifiedAt)
        .map(({ id, amount, description, transferDate, from, to }) => {
          const fromLabel = getAccountName(accounts, from);
          const toLabel = getAccountName(accounts, to);
          const prefix = amount < 0 ? "-" : "";
          const formattedAmount = `${prefix} $${Math.abs(amount).toFixed(2)}`;

          return (
            <IonItem
              key={id}
              onClick={() => onSelectTransfer(id)}
              style={{ cursor: "pointer" }}
            >
              <IonLabel>
                <p>
                  {formattedAmount}
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
