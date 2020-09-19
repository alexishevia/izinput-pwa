import React from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { IonApp, IonContent } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch } from "react-router";
import Errors from "./Errors";
import SyncStatus from "./SyncStatus";
import MainMenu from "./MainMenu";
import Accounts from "./screens/Accounts";
import Calculator from "./screens/Calculator";
import EditAccount from "./screens/EditAccount";
import EditExpense from "./screens/EditExpense";
import EditIncome from "./screens/EditIncome";
import EditTransfer from "./screens/EditTransfer";
import Home from "./screens/Home";
import NewAccount from "./screens/NewAccount";
import NewExpense from "./screens/NewExpense";
import NewIncome from "./screens/NewIncome";
import NewTransfer from "./screens/NewTransfer";
import NotFound from "./screens/NotFound";
import Screen from "./Screen";
import Settings from "./screens/Settings";
import Transactions from "./screens/Transactions";
import Trends from "./screens/Trends";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Overrides to ionic styles */
import "./App.css";

export default function App({ coreApp }) {
  return (
    <IonApp>
      <Errors coreApp={coreApp} />
      <IonContent>
        <IonReactRouter>
          <MainMenu />
          <Switch>
            <Route
              path="/accounts"
              component={() => (
                <Screen>
                  <Accounts coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              path="/calculator"
              component={() => (
                <Screen>
                  <Calculator coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              path="/trends"
              component={() => (
                <Screen>
                  <Trends coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              path="/newAccount"
              component={({ history }) => (
                <NewAccount coreApp={coreApp} onClose={history.goBack} />
              )}
            />
            <Route
              path="/editAccount/:id"
              component={({ history, match }) => (
                <EditAccount
                  coreApp={coreApp}
                  id={match.params.id}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/transactions"
              component={() => {
                return (
                  <Screen>
                    <Transactions coreApp={coreApp} />
                  </Screen>
                );
              }}
            />
            <Route
              path="/newExpense"
              component={({ history }) => (
                <NewExpense coreApp={coreApp} onClose={history.goBack} />
              )}
            />
            <Route
              path="/editExpense/:id"
              component={({ history, match }) => (
                <EditExpense
                  coreApp={coreApp}
                  id={match.params.id}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/newIncome"
              component={({ history }) => (
                <NewIncome coreApp={coreApp} onClose={history.goBack} />
              )}
            />
            <Route
              path="/editIncome/:id"
              component={({ history, match }) => (
                <EditIncome
                  coreApp={coreApp}
                  id={match.params.id}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/newTransfer"
              component={({ history }) => (
                <NewTransfer
                  type="TRANSFER"
                  coreApp={coreApp}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/editTransfer/:id"
              component={({ history, match }) => (
                <EditTransfer
                  coreApp={coreApp}
                  id={match.params.id}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/settings"
              component={() => (
                <Screen>
                  <Settings coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              path="/"
              exact
              component={() => (
                <Screen>
                  <Home coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              component={({ history }) => (
                <NotFound onClose={() => history.push("/")} />
              )}
            />
          </Switch>
        </IonReactRouter>
      </IonContent>
      <SyncStatus coreApp={coreApp} />
    </IonApp>
  );
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
