import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import useAsyncState from "../../hooks/useAsyncState";

export default function Calculator({ coreApp }) {
  function handleSubmit(evt) {
    evt.preventDefault();
  }

  const [availableMoney, reloadAvailableMoney] = useAsyncState(
    0,
    async function* loadAvailableMoney() {
      try {
        const allAccounts = await coreApp.getAccounts();
        const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
          "balance",
        ]);
        const total = extendedAccounts.reduce(
          (memo, { balance }) => memo + balance,
          0
        );
        yield total;
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  useEffect(() => {
    function reloadData() {
      reloadAvailableMoney();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [availableMoneyOverride, setAvailableMoneyOverride] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      <IonItem>
        <IonLabel position="stacked">Available Money:</IonLabel>
        <IonInput
          type="number"
          step="0.01"
          value={
            availableMoneyOverride === ""
              ? availableMoney
              : availableMoneyOverride
          }
          placeholder="$"
          onIonChange={(evt) => {
            setAvailableMoneyOverride(evt.detail.value);
          }}
          required
        />
      </IonItem>
    </form>
  );
}

Calculator.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
  }).isRequired,
};
