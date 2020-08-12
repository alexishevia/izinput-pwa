import React from "react";
import PropTypes from "prop-types";
import NewAccount from "./NewAccount";
import EditAccount from "./EditAccount";
import AccountsList from "./AccountsList";

export default class Accounts extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editing: null };

    this.updateAccount = this.updateAccount.bind(this);
  }

  async updateAccount(data) {
    const { updateAccount } = this.props;
    await updateAccount(data);
    this.setState({ editing: null });
  }

  render() {
    const { accounts, newError, newAccount } = this.props;
    const { editing } = this.state;
    let accountToEdit;
    if (editing) {
      accountToEdit = accounts.find((account) => account.id === editing);
    }
    return (
      <div>
        {accountToEdit ? (
          <EditAccount
            account={accountToEdit}
            editAccount={this.updateAccount}
            newError={newError}
            onCancel={() => this.setState({ editing: null })}
          />
        ) : (
          <NewAccount newError={newError} newAccount={newAccount} />
        )}
        <AccountsList
          accounts={accounts}
          onSelect={(id) => this.setState({ editing: id })}
        />
      </div>
    );
  }
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
  newError: PropTypes.func.isRequired,
  newAccount: PropTypes.func.isRequired,
};
