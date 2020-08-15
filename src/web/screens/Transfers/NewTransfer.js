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

const initialState = () => ({
  amount: "",
  from: null,
  to: null,
  description: "",
  transferDate: today(),
});

function buildTransferData({ from, to, amount, description, transferDate }) {
  const transferData = {
    from,
    to,
    amount: parseFloat(amount, 10),
    description,
    transferDate: isValidDayStr(transferDate) ? transferDate : today(),
  };

  new Validation(transferData, "from").required().string().notEmpty();
  new Validation(transferData, "to").required().string().notEmpty();
  new Validation(transferData, "amount").required().number().biggerThan(0);
  new Validation(transferData, "description").required().string();
  new Validation(transferData, "transferDate").required().dayString();

  return transferData;
}

class NewTransfer extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
  }

  async save(evt) {
    preventDefault(evt);
    const { newTransfer } = this.props;

    const transferData = buildTransferData(this.state);
    await newTransfer(transferData);
    this.setState(initialState());
  }

  render() {
    const { accounts } = this.props;
    const { amount, from, to, description, transferDate } = this.state;

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
          <Form.Button
            primary
            width={8}
            fluid
            onClick={(evt) => this.save(evt)}
          >
            <Icon name="dollar" />
            Add Transfer
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

NewTransfer.propTypes = {
  newTransfer: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default NewTransfer;
