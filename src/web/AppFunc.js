import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import useErrors from "./hooks/useErrors";
import Screen from "./Screen";
import Errors from "./Errors";
import ModalScreen from "./ModalScreen";
import Home from "./screens/Home";
import NewExpense from "./screens/NewExpense";
import NotFound from "./screens/NotFound";

export default function App({ coreApp }) {
  const [isSyncRunning] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [errors, addError, dismissErrors] = useErrors([]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);
      } catch (err) {
        addError(err);
      }
    }
    coreApp.on(coreApp.CHANGE_EVENT, loadAccounts);
    loadAccounts();
    return () => {
      coreApp.off(coreApp.CHANGE_EVENT, loadAccounts);
    };
  }, []);

  return (
    <IonApp>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            exact
            path="/"
            component={() => (
              <Screen isSyncRunning={isSyncRunning}>
                <Home coreApp={coreApp} accounts={accounts} />
              </Screen>
            )}
          />
          <Route
            path="/newExpense"
            component={({ history }) => (
              <ModalScreen title="New Expense" onClose={history.goBack}>
                <NewExpense
                  coreApp={coreApp}
                  accounts={accounts}
                  onClose={history.goBack}
                />
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
