import React from "react";
import PropTypes from "prop-types";
import NewTransaction from "./NewTransaction";
// import TransactionsList from "./TransactionsList";

export default function Transactions({ newError, newTransaction, accounts }) {
  return (
    <div>
      <NewTransaction
        newError={newError}
        newTransaction={newTransaction}
        accounts={accounts}
      />
      {/*
      <TransactionsList
        onSelectTransaction={() => {}}
      />
      */}
    </div>
  );
}

Transactions.propTypes = {
  newTransaction: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
