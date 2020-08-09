import React from "react";
import PropTypes from "prop-types";
import NewAccount from "./NewAccount";
import AccountsList from "./AccountsList";

export default function Accounts({ accounts, newError, newAccount }) {
  return (
    <div>
      <NewAccount newError={newError} newAccount={newAccount} />
      <AccountsList accounts={accounts} />
    </div>
  );
}

Accounts.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      initialBalance: PropTypes.number,
    })
  ).isRequired,
  newError: PropTypes.func.isRequired,
  newAccount: PropTypes.func.isRequired,
};
