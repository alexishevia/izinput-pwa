import React from "react";
import PropTypes from "prop-types";
import { Form, Icon } from "semantic-ui-react";
import Validation from "../../../helpers/Validation";

function preventDefault(evt) {
  evt.preventDefault();
  return false;
}

const initialState = () => ({
  name: null,
  type: null,
  initialBalance: null,
});

function notNull(val, fallback) {
  if (val !== null) {
    return val;
  }
  return fallback;
}

const accountTypeOptions = [
  { key: "", value: null, text: "" },
  { key: "INTERNAL", value: "INTERNAL", text: "Internal" },
  { key: "EXTERNAL", value: "EXTERNAL", text: "External" },
];

function buildAccountData({ id, name, type, initialBalance }) {
  const accountData = {
    id,
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

class EditAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
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
      "Are you sure you want to delete this account?"
    );
    if (!userConfirmed) {
      return;
    }
    const { onDelete } = this.props;
    onDelete();
  }

  async onSave(evt) {
    preventDefault(evt);
    const { newError, editAccount } = this.props;

    try {
      const accountData = buildAccountData(this.getData());
      await editAccount(accountData);
      this.setState(initialState());
    } catch (err) {
      newError(err);
    }
  }

  getData() {
    const { account } = this.props;
    const { name, type, initialBalance } = this.state;
    const data = {
      id: account.id,
      name: notNull(name, account.name),
      type: notNull(type, account.type),
      initialBalance: notNull(initialBalance, account.initialBalance),
    };

    data.initialBalance = parseFloat(data.initialBalance, 10);
    if (Number.isNaN(data.initialBalance)) {
      data.initialBalance = 0;
    }

    return data;
  }

  render() {
    const data = this.getData();
    const { name, type, initialBalance } = data;

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

EditAccount.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    initialBalance: PropTypes.number.isRequired,
  }).isRequired,
  newError: PropTypes.func.isRequired,
  editAccount: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default EditAccount;
