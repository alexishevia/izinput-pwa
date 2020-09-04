import React, { useState } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Screen from "./Screen";
import Home from "./screens/Home";
import NewTransfer from "./screens/NewTransfer";
import NewExpense from "./screens/NewExpense";
import EditTransfer from "./screens/EditTransfer";
import EditExpense from "./screens/EditExpense";
import NotFound from "./screens/NotFound";
import Sync from "./screens/Sync";

export default function App({ coreApp }) {
  const [isSyncRunning, setIsSyncRunning] = useState(false);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            exact
            path="/"
            component={() => (
              <Screen isSyncRunning={isSyncRunning}>
                <Home coreApp={coreApp} />
              </Screen>
            )}
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
              <NewTransfer
                type="INCOME"
                coreApp={coreApp}
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
            path="/sync"
            component={() => (
              <Screen isSyncRunning={isSyncRunning}>
                <Sync coreApp={coreApp} setIsSyncRunning={setIsSyncRunning} />
              </Screen>
            )}
          />
          <Route
            component={({ history }) => (
              <NotFound onClose={() => history.push("/")} />
            )}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
