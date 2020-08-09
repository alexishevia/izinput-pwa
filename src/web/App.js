import React from "react";
import PropTypes from "prop-types";
import { Router } from "@reach/router";
import Container from "./screens/Container";
import Transactions from "./screens/Transactions";
import Accounts from "./screens/Accounts";

function doNothing() {}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: [],
      accounts: [],
    };

    // bind functions
    this.newError = this.newError.bind(this);
    this.resetErrors = this.resetErrors.bind(this);
    this.reloadCoreAppData = this.reloadCoreAppData.bind(this);
    this.createAccount = this.createAccount.bind(this);

    this.reloadCoreAppData();
  }

  async reloadCoreAppData() {
    const { coreApp } = this.props;
    try {
      const accounts = await coreApp.getAccounts({ from: 0, to: 1000 });
      this.setState({ accounts });
    } catch (err) {
      this.newError(err);
    }
  }

  newError(err) {
    console.error(err);
    let msg;

    if (typeof err === typeof "string") {
      msg = err;
    } else if (err && err.message) {
      msg = err.message;
    } else {
      msg = "Unknown error";
    }

    const { errors } = this.state;
    this.setState({ errors: [...errors, msg] });
  }

  resetErrors() {
    this.setState({ errors: [] });
  }

  async createAccount(accountData) {
    const { coreApp } = this.props;
    await coreApp.createAccount(accountData);
    this.reloadCoreAppData();
  }

  render() {
    const { errors, accounts } = this.state;

    return (
      <Router>
        <Container path="/" errors={errors} resetErrors={this.resetErrors}>
          <Transactions
            path="/"
            newError={this.newError}
            accounts={accounts}
            newTransaction={doNothing}
          />
          <Accounts
            path="/accounts"
            accounts={accounts}
            newError={this.newError}
            newAccount={this.createAccount}
          />
        </Container>
      </Router>
    );
  }
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
