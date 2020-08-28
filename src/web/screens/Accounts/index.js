import React, { useState } from "react";
import PropTypes from "prop-types";
import NewAccount from "./NewAccount";
import EditAccount from "./EditAccount";
import AccountsList from "./AccountsList";

export default function Accounts({
  accounts,
  newAccount,
  newError,
  updateAccount,
}) {
  const [editing, setEditing] = useState(null);

  async function onUpdateAccount(data) {
    await updateAccount(data);
    setEditing(null);
  }

  let accountToEdit;
  if (editing) {
    accountToEdit = accounts.find((account) => account.id === editing);
  }
  return (
    <div>
      {accountToEdit ? (
        <EditAccount
          account={accountToEdit}
          editAccount={onUpdateAccount}
          onCancel={() => setEditing(null)}
          newError={newError}
        />
      ) : (
        <NewAccount newAccount={newAccount} newError={newError} />
      )}
      <AccountsList accounts={accounts} onSelect={(id) => setEditing(id)} />
    </div>
  );
}

Accounts.propTypes = {
  updateAccount: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      initialBalance: PropTypes.number,
    })
  ).isRequired,
  newAccount: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
};
