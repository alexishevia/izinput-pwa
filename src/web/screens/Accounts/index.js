import React from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import Errors from "../../Errors";
import useErrors from "../../hooks/useErrors";
import useCoreAppData from "../../hooks/useCoreAppData";
import AccountsList from "./AccountsList";

export default function Accounts({ coreApp }) {
  const [errors, addError, dismissErrors] = useErrors([]);
  const accounts = useCoreAppData({
    coreApp,
    initialValue: [],
    dataLoadFunc: async (setAccounts) => {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);
        const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
          "balance",
        ]);
        setAccounts(extendedAccounts);
      } catch (err) {
        addError(err);
      }
    },
  });

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
  }).isRequired,
};
