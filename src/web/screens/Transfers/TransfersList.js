import React from "react";
import PropTypes from "prop-types";
import { Container } from "semantic-ui-react";

function Transfer({ amount, from, to, transferDate, description, onClick }) {
  const prefix = amount < 0 ? "-" : "";
  const formattedAmount = `${prefix} $${Math.abs(amount).toFixed(2)}`;

  return (
    <Container text onClick={onClick} style={{ cursor: "pointer" }}>
      <p>
        {formattedAmount}
        <br />
        {from} =&gt; {to}
        <br />
        {description} {transferDate}
      </p>
    </Container>
  );
}

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

Transfer.propTypes = {
  amount: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  transferDate: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function TransfersList({ transfers, accounts, onSelectTransfer }) {
  return (
    <div>
      {transfers.map((transfer) => {
        const from = getAccountName(accounts, transfer.from);
        const to = getAccountName(accounts, transfer.to);
        return (
          <Transfer
            key={transfer.id}
            amount={transfer.amount}
            from={from}
            to={to}
            transferDate={transfer.transferDate}
            description={transfer.description}
            onClick={() => onSelectTransfer(transfer.id)}
          />
        );
      })}
    </div>
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
