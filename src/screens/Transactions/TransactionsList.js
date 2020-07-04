import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Icon, Container } from "semantic-ui-react";
import { selectors as txSelectors } from "../../redux/transactions";

const ICONS = {
  CREDIT: <Icon name="credit card outline" />,
  CASH: <Icon name="money bill alternate outline" />,
  TRANSFER: <Icon name="university" />,
};

function Transaction({
  amount,
  category,
  transactionDate,
  description,
  type,
  cashFlow,
  onClick,
}) {
  const prefix = amount < 0 ? "-" : "";
  const formatted = Math.abs(amount).toFixed(2);
  const icon = ICONS[type] || "";
  const title = `${prefix}$${formatted} ${category}`;
  const body = `${(
    cashFlow || ""
  ).toLowerCase()}: ${description}\n${transactionDate}`;

  return (
    <Container text onClick={onClick}>
      <p>
        {icon}
        {title}
        <br />
        {body}
      </p>
    </Container>
  );
}

Transaction.propTypes = {
  amount: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  transactionDate: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  cashFlow: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function TransactionsList({ transactions: txs, onSelectTransaction }) {
  return (
    <div>
      {txs.map((tx) => (
        <Transaction
          key={tx.id}
          amount={tx.amount}
          category={tx.category}
          transactionDate={tx.transactionDate}
          description={tx.description}
          type={tx.type}
          cashFlow={tx.cashFlow}
          onClick={() => onSelectTransaction(tx.id)}
        />
      ))}
    </div>
  );
}

TransactionsList.propTypes = {
  // own props
  onSelectTransaction: PropTypes.func.isRequired,

  // redux props
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      cashFlow: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      transactionDate: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const mapStateToProps = (state) => ({
  transactions: txSelectors.all(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsList);
