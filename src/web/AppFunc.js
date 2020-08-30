import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import Page from "./Page";
import Home from "./screens/Home";

function getErrorMsg(err) {
  if (typeof err === typeof "string") {
    return err;
  }
  if (err && err.message) {
    return err.message;
  }
  return "Unknown error";
}

export default function App({ coreApp }) {
  const [isSyncRunning, setIsSyncRunning] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [errors, setErrors] = useState([]);

  function removeError(oldErr) {
    setErrors(errors.filter((err) => err !== oldErr));
  }

  function onError(err) {
    console.error(err);
    const msg = getErrorMsg(err);
    setErrors([...errors, msg]);
  }

  useEffect(() => {
    async function loadAccounts() {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);
      } catch (err) {
        onError(err);
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
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/">
            <Page
              coreApp={coreApp}
              accounts={accounts}
              isSyncRunning={isSyncRunning}
              onError={onError}
              errors={errors}
              removeError={removeError}
            >
              <Home coreApp={coreApp} accounts={accounts} onError={onError} />
            </Page>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

App.propTypes = {
  coreApp: PropTypes.shape().isRequired,
};
