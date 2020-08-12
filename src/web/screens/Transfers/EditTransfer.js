import React from "react";
import PropTypes from "prop-types";
import { Form, Icon } from "semantic-ui-react";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";

function today() {
  return dateToDayStr(new Date());
}

function preventDefault(evt) {
  evt.preventDefault();
  return false;
}

function buildTransferData({
  id,
  from,
  to,
  amount,
  description,
  transferDate,
}) {
  const transferData = {
    id,
    from,
    to,
    amount: parseFloat(amount, 10),
    description,
    transferDate: isValidDayStr(transferDate) ? transferDate : today(),
  };

  new Validation(transferData, "id").required().string().notEmpty();
  new Validation(transferData, "from").required().string().notEmpty();
  new Validation(transferData, "to").required().string().notEmpty();
  new Validation(transferData, "amount").required().number().biggerThan(0);
  new Validation(transferData, "description").required().string();
  new Validation(transferData, "transferDate").required().dayString();

  return transferData;
}

const initialState = () => ({
  amount: null,
  from: null,
  to: null,
  description: null,
  transferDate: null,
});

function notNull(val, fallback) {
  if (val !== null) {
    return val;
  }
  return fallback;
}

class EditTransfer extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onCancel(evt) {
    preventDefault(evt);
    const { onCancel } = this.props;
    onCancel();
  }

  onDelete(evt) {
    preventDefault(evt);
    /* eslint no-alert: [0] */
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this transfer?"
    );
    if (!userConfirmed) {
      return;
    }
    const { onDelete } = this.props;
    onDelete();
  }

  async onSave(evt) {
    preventDefault(evt);
    const { editTransfer, newError } = this.props;

    try {
      const transferData = buildTransferData(this.getData());
      await editTransfer(transferData);
      this.setState(initialState());
    } catch (err) {
      newError(err);
    }
  }

  getData() {
    const { transfer } = this.props;
    const { amount, from, to, description, transferDate } = this.state;
    const data = {
      id: transfer.id,
      amount: notNull(amount, transfer.amount),
      from: notNull(from, transfer.from),
      to: notNull(to, transfer.to),
      description: notNull(description, transfer.description),
      transferDate: notNull(transferDate, transfer.transferDate),
    };

    data.amount = parseFloat(data.amount, 10);
    if (Number.isNaN(data.amount)) {
      data.amount = 0;
    }

    return data;
  }

  render() {
    const { accounts } = this.props;
    const data = this.getData();
    const { amount, from, to, description, transferDate } = data;

    const defaultAccount = { id: null, name: "" };
    const accountOptions = [defaultAccount, ...accounts].map((account) => ({
      key: account.id,
      text: account.name,
      value: account.id,
    }));

    return (
      <Form onSubmit={preventDefault}>
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Select
            width={4}
            label="From"
            placeholder="Account"
            options={accountOptions}
            value={from}
            onChange={(_, { value }) => this.setState({ from: value })}
          />
          <Form.Select
            width={4}
            label="To"
            placeholder="Account"
            options={accountOptions}
            value={to}
            onChange={(_, { value }) => this.setState({ to: value })}
          />
        </Form.Group>
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Input
            width={4}
            label="Amount"
            placeholder="Amount"
            type="text"
            icon="dollar"
            iconPosition="left"
            value={amount}
            onChange={(_, { value }) => this.setState({ amount: value })}
          />
          <Form.Input
            width={4}
            type="date"
            label="Date"
            icon="calendar"
            iconPosition="left"
            value={transferDate}
            onChange={(_, { value }) => this.setState({ transferDate: value })}
          />
        </Form.Group>
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Input
            width={8}
            type="text"
            label="Description"
            placeholder="Description"
            value={description}
            onChange={(_, { value }) => this.setState({ description: value })}
          />
        </Form.Group>
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Button primary width={4} fluid onClick={this.onSave}>
            <Icon name="edit" />
            Update
          </Form.Button>
          <Form.Button color="red" width={2} fluid onClick={this.onDelete}>
            <Icon name="trash" />
            Delete
          </Form.Button>
          <Form.Button width={2} fluid onClick={this.onCancel}>
            <Icon name="cancel" />
            Cancel
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

EditTransfer.propTypes = {
  transfer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    transferDate: PropTypes.string.isRequired,
  }).isRequired,
  editTransfer: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default EditTransfer;
