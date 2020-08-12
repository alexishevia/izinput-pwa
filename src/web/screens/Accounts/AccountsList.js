import React from "react";
import PropTypes from "prop-types";
import { Container } from "semantic-ui-react";

function Account({ name, type, initialBalance, onClick }) {
  return (
    <Container text onClick={onClick} style={{ cursor: "pointer" }}>
      <p>
        Name: {name}, Type: {type}{" "}
        {type === "INTERNAL" ? `, Initial Balance: ${initialBalance}` : ""}
      </p>
    </Container>
  );
}

Account.defaultProps = {
  initialBalance: 0,
};

Account.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  initialBalance: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

function sortByModifiedAt(a, b) {
  if (a.modifiedAt > b.modifiedAt) {
    return -1;
  }
  if (b.modifiedAt > a.modifiedAt) {
    return 1;
  }
  return 0;
}

export default function AccountsList({ accounts, onSelect }) {
  return (
    <div>
      {accounts
        .sort(sortByModifiedAt)
        .map(({ id, name, type, initialBalance }) => (
          <Account
            key={id}
            name={name}
            type={type}
            initialBalance={initialBalance}
            onClick={() => onSelect(id)}
          />
        ))}
    </div>
  );
}

AccountsList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      initialBalance: PropTypes.number,
    })
  ).isRequired,
};
