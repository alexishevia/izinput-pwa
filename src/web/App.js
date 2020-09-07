import React, { useState } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { IonApp, IonContent } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch } from "react-router";
import Errors from "./Errors";
import SyncStatus from "./SyncStatus";
import EditAccount from "./screens/EditAccount";
import EditExpense from "./screens/EditExpense";
import EditIncome from "./screens/EditIncome";
import EditTransfer from "./screens/EditTransfer";
import Home from "./screens/Home";
import Accounts from "./screens/Accounts";
import NewAccount from "./screens/NewAccount";
import NewExpense from "./screens/NewExpense";
import NewIncome from "./screens/NewIncome";
import NewTransfer from "./screens/NewTransfer";
import NotFound from "./screens/NotFound";
import Screen from "./Screen";
import Sync from "./screens/Sync";
import Expenses from "./screens/Expenses";
import Income from "./screens/Income";
import Transfers from "./screens/Transfers";

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
  const [errors, setErrors] = useState([]);

  function addError(err) {
    setErrors([...errors, err]);
  }

  function dismissErrors() {
    setErrors([]);
  }

  return (
    <IonApp>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonContent>
        <IonReactRouter>
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
              path="/expenses"
              component={() => {
                return (
                  <Screen>
                    <Expenses coreApp={coreApp} />
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
              path="/income"
              component={() => (
                <Screen>
                  <Income coreApp={coreApp} />
                </Screen>
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
              path="/transfers"
              component={() => (
                <Screen>
                  <Transfers coreApp={coreApp} />
                </Screen>
              )}
            />
            <Route
              path="/newTransfer"
              component={({ history }) => (
                <NewTransfer
                  type="TRANSFER"
                  coreApp={coreApp}
                  onClose={history.goBack}
                  addError={addError}
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
              path="/sync"
              component={() => (
                <Screen>
                  <Sync coreApp={coreApp} />
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
