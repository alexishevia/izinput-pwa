import React from "react";
import PropTypes from "prop-types";
import NewTransfer from "./NewTransfer";
import EditTransfer from "./EditTransfer";
import TransfersList from "./TransfersList";

export default class Transfers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: null,
    };

    this.updateTransfer = this.updateTransfer.bind(this);
  }

  async updateTransfer(data) {
    const { updateTransfer } = this.props;
    await updateTransfer(data);
    this.setState({ editing: null });
  }

  render() {
    const { newError, newTransfer, accounts, transfers } = this.props;
    const { editing } = this.state;
    let transferToEdit;
    if (editing) {
      transferToEdit = transfers.find((transfer) => transfer.id === editing);
    }
    return (
      <div>
        {transferToEdit ? (
          <EditTransfer
            transfer={transferToEdit}
            editTransfer={this.updateTransfer}
            newError={newError}
            accounts={accounts}
            onCancel={() => this.setState({ editing: null })}
          />
        ) : (
          <NewTransfer
            newError={newError}
            newTransfer={newTransfer}
            accounts={accounts}
          />
        )}
        <TransfersList
          accounts={accounts}
          transfers={transfers}
          onSelectTransfer={(id) => this.setState({ editing: id })}
        />
      </div>
    );
  }
}

Transfers.propTypes = {
  newTransfer: PropTypes.func.isRequired,
  updateTransfer: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
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
