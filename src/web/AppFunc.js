import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import Screen from "./Screen";
import ModalScreen from "./ModalScreen";
import Home from "./screens/Home";
import NewExpense from "./screens/NewExpense";
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
            path="/newExpense"
            component={({ history }) => (
              <ModalScreen title="New Expense" onClose={history.goBack}>
                <NewExpense coreApp={coreApp} onClose={history.goBack} />
              </ModalScreen>
            )}
          />
          <Route
            component={({ history }) => (
              <ModalScreen title="Not Found" onClose={() => history.push("/")}>
                <NotFound />
              </ModalScreen>
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
