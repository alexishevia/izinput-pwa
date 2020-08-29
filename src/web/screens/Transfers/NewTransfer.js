import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
} from "@ionic/react";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";

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

export default function NewTransfer({ accounts, newTransfer, newError }) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [description, setDescription] = useState("");
  const [transferDate, setTransferDate] = useState(today());

  async function onSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        from,
        to,
        amount,
        description,
        transferDate,
      });
      await newTransfer(transferData);
      setAmount("");
      setFrom(null);
      setTo(null);
      setDescription("");
      setTransferDate(today());
    } catch (err) {
      newError(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <IonItem>
        <IonLabel position="stacked">From:</IonLabel>
        <IonSelect
          value={from}
          onIonChange={(evt) => {
            setFrom(evt.detail.value);
          }}
          placeholder="Account"
        >
          {accounts.map(({ id, name }) => (
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
          {accounts.map(({ id, name }) => (
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
      <IonButton type="submit">Add Transfer</IonButton>
    </form>
  );
}

NewTransfer.propTypes = {
  newTransfer: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
