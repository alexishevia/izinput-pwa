import React from "react";
import PropTypes from "prop-types";
import TransfersList from "../../Transfers/TransfersList";

export default function Transfers({ accounts, transfers }) {
  return (
    <>
      <TransfersList accounts={accounts} transfers={transfers} />
    </>
  );
}

Transfers.propTypes = {
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
