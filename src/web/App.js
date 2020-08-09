import React from "react";
import PropTypes from "prop-types";
import { Router } from "@reach/router";
import Container from "./screens/Container";
import Transfers from "./screens/Transfers";
import Accounts from "./screens/Accounts";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: [],
      accounts: [],
      transfers: [],
    };

    // bind functions
    this.newError = this.newError.bind(this);
    this.resetErrors = this.resetErrors.bind(this);
    this.reloadCoreAppData = this.reloadCoreAppData.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.createTransfer = this.createTransfer.bind(this);
    this.updateTransfer = this.updateTransfer.bind(this);

    this.reloadCoreAppData();
  }

  async reloadCoreAppData() {
    const { coreApp } = this.props;
    try {
      const accounts = await coreApp.getAccounts({ from: 0, to: 1000 });
      const transfers = await coreApp.getTransfers({ from: 0, to: 1000 });
      this.setState({ accounts, transfers });
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

  async createTransfer(transferData) {
    const { coreApp } = this.props;
    await coreApp.createTransfer(transferData);
    this.reloadCoreAppData();
  }

  async updateTransfer(transferData) {
    const { coreApp } = this.props;
    await coreApp.updateTransfer(transferData);
    this.reloadCoreAppData();
  }

  render() {
    const { errors, accounts, transfers } = this.state;

    return (
      <Router>
        <Container path="/" errors={errors} resetErrors={this.resetErrors}>
          <Transfers
            path="/"
            newError={this.newError}
            accounts={accounts}
            newTransfer={this.createTransfer}
            updateTransfer={this.updateTransfer}
            transfers={transfers}
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
