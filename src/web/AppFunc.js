import React, { useState } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Screen from "./Screen";
import Home from "./screens/Home";
import NewExpense from "./screens/NewExpense";
import EditTransfer from "./screens/EditTransfer";
import NotFound from "./screens/NotFound";

export default function App({ coreApp }) {
  const [isSyncRunning] = useState(false);

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
            exact
            path="/newExpense"
            component={({ history }) => (
              <NewExpense coreApp={coreApp} onClose={history.goBack} />
            )}
          />
          <Route
            exact
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
