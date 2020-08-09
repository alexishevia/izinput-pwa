import React from "react";
import PropTypes from "prop-types";
import NewTransfer from "./NewTransfer";
import TransfersList from "./TransfersList";

export default function Transfers({
  newError,
  newTransfer,
  accounts,
  transfers,
}) {
  return (
    <div>
      <NewTransfer
        newError={newError}
        newTransfer={newTransfer}
        accounts={accounts}
      />
      <TransfersList
        accounts={accounts}
        transfers={transfers}
        onSelectTransfer={() => {}}
      />
    </div>
  );
}

Transfers.propTypes = {
  newTransfer: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
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
