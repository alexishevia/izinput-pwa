import React from "react";
import PropTypes from "prop-types";
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import Errors from "./Errors";
import MainMenu from "./MainMenu";
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
      <IonApp>
        <IonReactRouter>
          <MainMenu />

          <IonPage id="main-content">
            <IonHeader>
              <IonToolbar color="primary">
                <IonButtons slot="start">
                  <IonMenuButton />
                </IonButtons>
                <IonTitle>Invoice Zero</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {isSyncRunning ? (
                <div style={{ backgroundColor: "#eee", marginBottom: "1em" }}>
                  syncing...
                </div>
              ) : null}
              <Errors errors={errors} resetErrors={this.resetErrors} />
              <IonRouterOutlet>
                <Route path="/transfers">
                  <Transfers
                    newError={this.newError}
                    accounts={accounts}
                    newTransfer={this.createTransfer}
                    updateTransfer={this.updateTransfer}
                    deleteTransfer={this.deleteTransfer}
                    transfers={transfers}
                  />
                </Route>
                <Route path="/accounts">
                  <Accounts
                    accounts={accounts}
                    updateAccount={this.updateAccount}
                    newError={this.newError}
                    newAccount={this.createAccount}
                  />
                </Route>
                <Route path="/sync">
                  <Sync
                    isLoggedIn={isGDriveLoggedIn}
                    onLogin={this.loginToGDrive}
                    onLogout={this.logoutFromGDrive}
                    onError={this.newError}
                    file={gDriveFile}
                    onFilePick={this.selectGDriveFile}
                    onRunSync={this.runSync}
                  />
                </Route>
                <Route
                  exact
                  path="/"
                  render={() => <Redirect to="/transfers" />}
                />
              </IonRouterOutlet>
            </IonContent>
          </IonPage>
        </IonReactRouter>
      </IonApp>
    );
  }
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
