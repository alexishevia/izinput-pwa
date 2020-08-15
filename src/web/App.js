import React from "react";
import PropTypes from "prop-types";
import { Router } from "@reach/router";
import Container from "./screens/Container";
import Transfers from "./screens/Transfers";
import Accounts from "./screens/Accounts";
import Sync from "./screens/Sync";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      errors: [],
      gDriveFile: null,
      isGDriveLoggedIn: false,
      isSyncRunning: false,
      transfers: [],
    };

    // bind functions
    this.createAccount = this.createAccount.bind(this);
    this.createTransfer = this.createTransfer.bind(this);
    this.deleteTransfer = this.deleteTransfer.bind(this);
    this.loginToGDrive = this.loginToGDrive.bind(this);
    this.logoutFromGDrive = this.logoutFromGDrive.bind(this);
    this.newError = this.newError.bind(this);
    this.reloadCoreAppData = this.reloadCoreAppData.bind(this);
    this.reloadGDriveData = this.reloadGDriveData.bind(this);
    this.resetErrors = this.resetErrors.bind(this);
    this.runSync = this.runSync.bind(this);
    this.selectGDriveFile = this.selectGDriveFile.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.updateTransfer = this.updateTransfer.bind(this);

    this.reloadCoreAppData();
    this.reloadGDriveData();
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

  async reloadCoreAppData() {
    try {
      const { coreApp } = this.props;
      const accounts = await coreApp.getAccounts({ from: 0, to: 1000 });
      const transfers = await coreApp.getTransfers({ from: 0, to: 1000 });
      this.setState({ accounts, transfers });
    } catch (err) {
      this.newError(err);
    }
  }

  async reloadGDriveData() {
    try {
      const { coreApp } = this.props;
      const isGDriveLoggedIn = await coreApp.isGDriveLoggedIn();
      const gDriveFile = coreApp.gDriveGetSelectedFile();
      this.setState({ isGDriveLoggedIn, gDriveFile });
    } catch (err) {
      this.newError(err);
    }
  }

  async createAccount(accountData) {
    try {
      const { coreApp } = this.props;
      await coreApp.createAccount(accountData);
      this.reloadCoreAppData();
    } catch (err) {
      this.newError(err);
    }
  }

  async updateAccount(accountData) {
    try {
      const { coreApp } = this.props;
      await coreApp.updateAccount(accountData);
      this.reloadCoreAppData();
    } catch (err) {
      this.newError(err);
    }
  }

  async createTransfer(transferData) {
    try {
      const { coreApp } = this.props;
      await coreApp.createTransfer(transferData);
      this.reloadCoreAppData();
    } catch (err) {
      this.newError(err);
    }
  }

  async updateTransfer(transferData) {
    try {
      const { coreApp } = this.props;
      await coreApp.updateTransfer(transferData);
      this.reloadCoreAppData();
    } catch (err) {
      this.newError(err);
    }
  }

  async deleteTransfer(id) {
    try {
      const { coreApp } = this.props;
      await coreApp.deleteTransfer(id);
      this.reloadCoreAppData();
    } catch (err) {
      this.newError(err);
    }
  }

  async runSync() {
    try {
      const { coreApp } = this.props;
      this.setState({ isSyncRunning: true });
      await coreApp.runSync();
      this.reloadCoreAppData();
      this.setState({ isSyncRunning: false });
    } catch (err) {
      this.newError(err);
    }
  }

  async loginToGDrive() {
    try {
      const { coreApp } = this.props;
      await coreApp.gDriveLogin();
      this.reloadGDriveData();
    } catch (err) {
      this.newError(err);
    }
  }

  async logoutFromGDrive() {
    try {
      const { coreApp } = this.props;
      await coreApp.gDriveLogout();
      this.reloadGDriveData();
    } catch (err) {
      this.newError(err);
    }
  }

  selectGDriveFile(file) {
    try {
      const { coreApp } = this.props;
      coreApp.gDriveSelectFile(file);
      this.reloadGDriveData();
    } catch (err) {
      this.newError(err);
    }
  }

  render() {
    const {
      accounts,
      errors,
      gDriveFile,
      isGDriveLoggedIn,
      isSyncRunning,
      transfers,
    } = this.state;

    return (
      <Router>
        <Container
          path="/"
          errors={errors}
          resetErrors={this.resetErrors}
          isSyncRunning={isSyncRunning}
        >
          <Transfers
            path="/"
            newError={this.newError}
            accounts={accounts}
            newTransfer={this.createTransfer}
            updateTransfer={this.updateTransfer}
            deleteTransfer={this.deleteTransfer}
            transfers={transfers}
          />
          <Accounts
            path="/accounts"
            accounts={accounts}
            updateAccount={this.updateAccount}
            newError={this.newError}
            newAccount={this.createAccount}
          />
          <Sync
            path="/sync"
            isLoggedIn={isGDriveLoggedIn}
            onLogin={this.loginToGDrive}
            onLogout={this.logoutFromGDrive}
            onError={this.newError}
            file={gDriveFile}
            onFilePick={this.selectGDriveFile}
            onRunSync={this.runSync}
          />
        </Container>
      </Router>
    );
  }
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
