import React, { useState, useMemo } from "react";
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

function buildAccountData({ id, name, type, initialBalance }) {
  const accountData = {
    id,
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

export default function NewAccount({
  account,
  editAccount,
  onCancel,
  newError,
}) {
  const [name, setName] = useState(null);
  const [type, setType] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null);

  useMemo(
    function resetState() {
      setName(null);
      setType(null);
      setInitialBalance(null);
    },
    [account.id]
  );

  const typeVal = type === null ? account.type : type;
  const nameVal = name === null ? account.name : name;
  const balanceVal =
    initialBalance === null ? account.initialBalance : initialBalance;

  function handleCancel(evt) {
    evt.preventDefault();
    onCancel();
  }

  async function handleSave(evt) {
    evt.preventDefault();
    try {
      const accountData = buildAccountData({
        id: account.id,
        name: nameVal,
        type: typeVal,
        initialBalance: balanceVal,
      });
      await editAccount(accountData);
    } catch (err) {
      newError(err);
    }
  }

  return (
    <form onSubmit={handleSave}>
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
        <IonLabel position="stacked">Type:</IonLabel>
        <IonSelect
          value={typeVal}
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
      {typeVal === "INTERNAL" ? (
        <IonItem>
          <IonLabel position="stacked">Initial Balance:</IonLabel>
          <IonInput
            type="text"
            value={balanceVal}
            onIonChange={(evt) => {
              setInitialBalance(evt.detail.value);
            }}
          />
        </IonItem>
      ) : null}
      <IonButton type="submit">Update</IonButton>
      <IonButton color="medium" onClick={handleCancel}>
        Cancel
      </IonButton>
    </form>
  );
}

NewAccount.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    initialBalance: PropTypes.number.isRequired,
  }).isRequired,
  editAccount: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
