import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";
import useErrors from "../../hooks/useErrors";
import Errors from "../../Errors";
import ModalToolbar from "../../ModalToolbar";

function today() {
  return dateToDayStr(new Date());
}

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

function buildTransferData({
  fromID,
  toID,
  amount,
  description,
  transactionDate,
}) {
  const transferData = {
    fromID,
    toID,
    amount: parseFloat(amount, 10),
    description,
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(transferData, "fromID").required().string().notEmpty();
  new Validation(transferData, "toID").required().string().notEmpty();
  new Validation(transferData, "amount").required().number().biggerThan(0);
  new Validation(transferData, "description").required().string();
  new Validation(transferData, "transactionDate").required().dayString();

  return transferData;
}

export default function NewTransfer({ coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [fromID, setFromID] = useState(null);
  const [toID, setToID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setTransferDate] = useState(today());
  const [errors, addError, dismissErrors] = useErrors([]);
  const [accounts, setAccounts] = useState(null);

  function resetFormData() {
    setAmount(null);
    setFromID(null);
    setToID(null);
    setDescription(null);
    setTransferDate(today());
    setAccounts(null);
  }

  useEffect(
    function loadAccounts() {
      if (accounts !== null) {
        return;
      }
      setAccounts([]);
      async function loadAccountsData() {
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
      }
      loadAccountsData();
    },
    [accounts, coreApp, addError]
  );

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        fromID,
        toID,
        amount,
        description,
        transactionDate,
      });
      await coreApp.createTransfer(transferData);
      resetFormData();
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    resetFormData();
    onClose();
  }

  return (
    <IonPage id="main-content">
      <ModalToolbar title="New Transfer" color="tertiary" onClose={onClose} />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={fromID}
              onIonChange={(evt) => {
                setFromID(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || [])
                .sort(sortByName)
                .map(({ id: accID, name, balance }) => (
                  <IonSelectOption key={accID} value={accID}>
                    {name}
                    {balance ? ` ($${balance} available)` : ""}
                  </IonSelectOption>
                ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">To:</IonLabel>
            <IonSelect
              value={toID}
              onIonChange={(evt) => {
                setToID(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || [])
                .sort(sortByName)
                .map(({ id: accID, name, balance }) => (
                  <IonSelectOption key={accID} value={accID}>
                    {name}
                    {balance ? ` ($${balance} available)` : ""}
                  </IonSelectOption>
                ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Amount:</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={amount}
              placeholder="$"
              onIonChange={(evt) => {
                setAmount(evt.detail.value);
              }}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Date:</IonLabel>
            <IonDatetime
              value={transactionDate}
              onIonChange={(evt) => {
                setTransferDate(evt.detail.value);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description:</IonLabel>
            <IonInput
              type="text"
              value={description}
              onIonChange={(evt) => {
                setDescription(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit" color="tertiary">
            Add Transfer
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewTransfer.propTypes = {
  coreApp: PropTypes.shape({
    createTransfer: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
