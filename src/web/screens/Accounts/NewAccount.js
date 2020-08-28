import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
} from "@ionic/react";
import Validation from "../../../helpers/Validation";

const accountTypeOptions = [
  { key: "INTERNAL", value: "INTERNAL", text: "Internal" },
  { key: "EXTERNAL", value: "EXTERNAL", text: "External" },
];

function buildAccountData({ name, type, initialBalance }) {
  const accountData = {
    name,
    type,
    initialBalance: type === "EXTERNAL" ? 0 : parseFloat(initialBalance, 10),
  };

  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "type")
    .required()
    .oneOf(["INTERNAL", "EXTERNAL"]);
  new Validation(accountData, "initialBalance").required().number();

  return accountData;
}

export default function NewAccount({ newAccount, newError }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [initialBalance, setInitialBalance] = useState("");

  async function onSubmit(evt) {
    evt.preventDefault();
    try {
      const accountData = buildAccountData({ name, type, initialBalance });
      await newAccount(accountData);
      setName("");
      setType("");
      setInitialBalance(0);
    } catch (err) {
      newError(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <IonItem>
        <IonLabel position="stacked">Name:</IonLabel>
        <IonInput
          type="text"
          value={name}
          onIonChange={(evt) => {
            setName(evt.detail.value);
          }}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Type:</IonLabel>
        <IonSelect
          value={type}
          onIonChange={(evt) => {
            setType(evt.detail.value);
          }}
        >
          {accountTypeOptions.map(({ key, value, text }) => (
            <IonSelectOption key={key} value={value}>
              {text}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      {type === "INTERNAL" ? (
        <IonItem>
          <IonLabel position="stacked">Initial Balance:</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            value={initialBalance}
            onIonChange={(evt) => {
              setInitialBalance(evt.detail.value);
            }}
          />
        </IonItem>
      ) : null}
      <IonButton type="submit">Create Account</IonButton>
    </form>
  );
}

NewAccount.propTypes = {
  newAccount: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
};
