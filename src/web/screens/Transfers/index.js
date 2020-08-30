import React, { useState } from "react";
import PropTypes from "prop-types";
import NewTransfer from "./NewTransfer";
import EditTransfer from "./EditTransfer";
import TransfersList from "./TransfersList";

export default function Transfers({
  newTransfer,
  updateTransfer,
  onError,
  accounts,
  transfers,
  deleteTransfer,
}) {
  const [editing, setEditing] = useState(null);

  async function onUpdateTransfer(data) {
    await updateTransfer(data);
    setEditing(null);
  }

  let transferToEdit;
  if (editing) {
    transferToEdit = transfers.find((transfer) => transfer.id === editing);
  }
  return (
    <>
      {transferToEdit ? (
        <EditTransfer
          transfer={transferToEdit}
          editTransfer={onUpdateTransfer}
          accounts={accounts}
          onDelete={() => deleteTransfer(transferToEdit.id)}
          onCancel={() => setEditing(null)}
          onError={onError}
        />
      ) : (
        <NewTransfer
          newTransfer={newTransfer}
          onError={onError}
          accounts={accounts}
        />
      )}
      <TransfersList
        accounts={accounts}
        transfers={transfers}
        onSelectTransfer={(id) => setEditing(id)}
      />
    </>
  );
}

Transfers.propTypes = {
  newTransfer: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  updateTransfer: PropTypes.func.isRequired,
  deleteTransfer: PropTypes.func.isRequired,
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
