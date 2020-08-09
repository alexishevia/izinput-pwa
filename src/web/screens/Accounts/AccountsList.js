import React from "react";
import PropTypes from "prop-types";
import { Container } from "semantic-ui-react";

function Account({ name, type, initialBalance }) {
  return (
    <Container text>
      <p>
        {name} | Type: {type}{" "}
        {type === "INTERNAL" ? `| Initial Balance: ${initialBalance}` : ""}
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

export default function AccountsList({ accounts }) {
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
          />
        ))}
    </div>
  );
}

AccountsList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      initialBalance: PropTypes.number,
    })
  ).isRequired,
};
