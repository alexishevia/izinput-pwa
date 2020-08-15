import React from "react";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";
import Validation from "../../../helpers/Validation";

function preventDefault(evt) {
  evt.preventDefault();
  return false;
}

const initialState = () => ({
  name: "",
  type: "",
  initialBalance: "",
});

const accountTypeOptions = [
  { key: "", value: "", text: "" },
  { key: "INTERNAL", value: "INTERNAL", text: "Internal" },
  { key: "EXTERNAL", value: "EXTERNAL", text: "External" },
];

function buildAccountData({ name, type, initialBalance }) {
  const accountData = {
    name,
    type,
    initialBalance: type === "EXTERNAL" ? 0 : parseFloat(initialBalance, 10),
  };

  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "type")
    .required()
    .oneOf(["INTERNAL", "EXTERNAL"]);
  new Validation(accountData, "initialBalance").required().number();

  return accountData;
}

class NewAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
  }

  async save(evt) {
    preventDefault(evt);
    const { newAccount } = this.props;

    const accountData = buildAccountData(this.state);
    await newAccount(accountData);
    this.setState(initialState());
  }

  render() {
    const { name, type, initialBalance } = this.state;

    return (
      <Form onSubmit={preventDefault}>
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Input
            width={4}
            label="Name"
            type="text"
            value={name}
            onChange={(_, { value }) => this.setState({ name: value })}
          />
          <Form.Select
            width={4}
            label="Type"
            placeholder="Type"
            options={accountTypeOptions}
            value={type}
            onChange={(_, { value }) => this.setState({ type: value })}
          />
        </Form.Group>
        {type === "INTERNAL" ? (
          <Form.Group style={{ justifyContent: "center" }}>
            <Form.Input
              width={8}
              label="Initial Balance"
              placeholder="Amount"
              type="text"
              value={initialBalance}
              onChange={(_, { value }) =>
                this.setState({ initialBalance: value })
              }
            />
          </Form.Group>
        ) : null}
        <Form.Group style={{ justifyContent: "center" }}>
          <Form.Button
            primary
            width={8}
            fluid
            onClick={(evt) => this.save(evt)}
          >
            Create Account
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

NewAccount.propTypes = {
  newAccount: PropTypes.func.isRequired,
};

export default NewAccount;
