import React, { useState } from "react";
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
import useCoreAppData from "../../hooks/useCoreAppData";
import Errors from "../../Errors";
import ModalToolbar from "../../ModalToolbar";

function today() {
  return dateToDayStr(new Date());
}

function buildTransferData({ from, to, amount, description, transferDate }) {
  const transferData = {
    from,
    to,
    amount: parseFloat(amount, 10),
    description,
    transferDate: isValidDayStr(transferDate) ? transferDate : today(),
  };

  new Validation(transferData, "from").required().string().notEmpty();
  new Validation(transferData, "to").required().string().notEmpty();
  new Validation(transferData, "amount").required().number().biggerThan(0);
  new Validation(transferData, "description").required().string();
  new Validation(transferData, "transferDate").required().dayString();

  return transferData;
}

export default function NewExpense({ coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [description, setDescription] = useState(null);
  const [transferDate, setTransferDate] = useState(today());
  const [errors, addError, dismissErrors] = useErrors([]);

  const accounts = useCoreAppData(coreApp, [], async (setAccounts) => {
    try {
      const allAccounts = await coreApp.getAccounts();
      setAccounts(allAccounts);
    } catch (err) {
      addError(err);
    }
  });

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        from,
        to,
        amount,
        description,
        transferDate,
      });
      await coreApp.createTransfer(transferData);
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  return (
    <IonPage id="main-content">
      <ModalToolbar title="New Expense" onClose={onClose} />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={from}
              onIonChange={(evt) => {
                setFrom(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || []).map(({ id, name }) => (
                <IonSelectOption key={id} value={id}>
                  {name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">To:</IonLabel>
            <IonSelect
              value={to}
              onIonChange={(evt) => {
                setTo(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || []).map(({ id, name }) => (
                <IonSelectOption key={id} value={id}>
                  {name}
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
              value={transferDate}
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
          <IonButton type="submit">Add Expense</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewExpense.propTypes = {
  coreApp: PropTypes.shape({
    createTransfer: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
