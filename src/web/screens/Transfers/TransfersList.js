import React from "react";
import PropTypes from "prop-types";
import { IonList } from "@ionic/react";
import Transfer from "../../Transfer";

function TransfersList({ transfers, accounts }) {
  if (!transfers.length) {
    return null;
  }

  return (
    <IonList>
      {transfers.map((transfer) => (
        <Transfer key={transfer.id} transfer={transfer} accounts={accounts} />
      ))}
    </IonList>
  );
}

TransfersList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  transfers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default TransfersList;
