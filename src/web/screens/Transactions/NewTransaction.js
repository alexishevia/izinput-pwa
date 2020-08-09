import React from "react";
import PropTypes from "prop-types";
import { Form, Icon } from "semantic-ui-react";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";

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
  transactionDate: today(),
});

class NewTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
  }

  save(evt) {
    preventDefault(evt);
    const { amount, from, to, description, transactionDate } = this.state;
    const { newTransaction, newError } = this.props;
    const amountAsFloat = parseFloat(amount, 10);
    if (amountAsFloat === 0 || Number.isNaN(amountAsFloat)) {
      newError("Amount must be a number bigger than 0.");
      return;
    }
    newTransaction({
      amount: amountAsFloat,
      from,
      to,
      description,
      transactionDate: isValidDayStr(transactionDate)
        ? transactionDate
        : today(),
    });
    this.setState(initialState());
  }

  render() {
    const { accounts } = this.props;
    const { amount, from, to, description, transactionDate } = this.state;

    const defaultAccount = { id: null, name: "" };
    const accountOptions = [defaultAccount, ...accounts].map((account) => ({
      key: account.id,
      text: account.name,
      value: account.id,
    }));

    return (
      <Form onSubmit={preventDefault}>
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
            value={transactionDate}
            onChange={(_, { value }) =>
              this.setState({ transactionDate: value })
            }
          />
        </Form.Group>
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
            Add Transaction
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

NewTransaction.propTypes = {
  newTransaction: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default NewTransaction;
