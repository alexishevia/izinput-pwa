import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import useErrors from "../../hooks/useErrors";
import Validation from "../../../helpers/Validation";
import Errors from "../../Errors";
import ModalToolbar from "../../ModalToolbar";

function buildAccountData({ id, name, initialBalance }) {
  const accountData = {
    id,
    name,
    initialBalance: parseFloat(initialBalance, 10),
  };
  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "initialBalance")
    .required()
    .number()
    .biggerOrEqualThan(0);
  return accountData;
}

export default function EditAccount({ id, coreApp, onClose }) {
  const [name, setName] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null);
  const [errors, addError, dismissErrors] = useErrors([]);
  const [account, setAccount] = useState(null);

  function resetFormData() {
    setName(null);
    setInitialBalance(null);
  }

  useEffect(
    function loadAccount() {
      if (account !== null) {
        return;
      }
      setAccount({});
      async function loadAccountData() {
        try {
          const accountData = await coreApp.getAccount(id);
          setAccount(accountData);
        } catch (err) {
          addError(err);
        }
      }
      loadAccountData();
    },
    [account, coreApp, id, addError]
  );

  useEffect(resetFormData, [id]);

  const nameVal = name ?? account?.name;
  const initialBalanceVal = initialBalance ?? account?.initialBalance;

  function handleCancel(evt) {
    evt.preventDefault();
    resetFormData();
    onClose();
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const accountData = buildAccountData({
        id,
        name: nameVal,
        initialBalance: initialBalanceVal,
      });
      await coreApp.updateAccount(accountData);
      resetFormData();
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  return (
    <IonPage id="main-content">
      <ModalToolbar title="Edit Account" onClose={onClose} />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">Name:</IonLabel>
            <IonInput
              type="text"
              value={nameVal}
              onIonChange={(evt) => {
                setName(evt.detail.value);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Initial Balance:</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={initialBalanceVal}
              placeholder="$"
              onIonChange={(evt) => {
                setInitialBalance(evt.detail.value);
              }}
              required
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Update Account</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditAccount.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    getAccount: PropTypes.func.isRequired,
    updateAccount: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
