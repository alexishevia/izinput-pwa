import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import Errors from "../../Errors";
import useErrors from "../../hooks/useErrors";
import useAsyncState from "../../hooks/useAsyncState";
import AccountsList from "./AccountsList";

export default function Accounts({ coreApp }) {
  window.coreApp = coreApp;
  const [errors, addError, dismissErrors] = useErrors([]);
  const [accounts, reloadAccounts] = useAsyncState(
    [],
    async function* loadAccounts() {
      try {
        const allAccounts = await coreApp.getAccounts();
        yield allAccounts;
        yield await coreApp.extendAccounts(allAccounts, ["balance"]);
      } catch (err) {
        addError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  useEffect(() => {
    coreApp.on(coreApp.CHANGE_EVENT, reloadAccounts);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadAccounts);
  }, []);

  return (
    <>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <AccountsList accounts={accounts} />
    </>
  );
}

Accounts.propTypes = {
  coreApp: PropTypes.shape({
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getRecentTransactions: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    CHANGE_EVENT: PropTypes.string.isRequired,
  }).isRequired,
};
