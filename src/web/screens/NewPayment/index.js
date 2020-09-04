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

function buildPaymentData({
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const paymentData = {
    accountID,
    categoryID,
    amount: parseFloat(amount, 10),
    description,
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(paymentData, "accountID").required().string().notEmpty();
  new Validation(paymentData, "categoryID").required().string().notEmpty();
  new Validation(paymentData, "amount").required().number().biggerThan(0);
  new Validation(paymentData, "description").required().string();
  new Validation(paymentData, "transactionDate").required().dayString();

  return paymentData;
}

export default function NewPayment({ coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setPaymentDate] = useState(today());
  const [errors, addError, dismissErrors] = useErrors([]);
  const [accounts, setAccounts] = useState(null);
  const [categories, setCategories] = useState(null);

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

  useEffect(
    function loadCategories() {
      if (categories !== null) {
        return;
      }
      setCategories([]);
      async function loadCategoriesData() {
        try {
          const allCategories = await coreApp.getCategories();
          setCategories(allCategories);
        } catch (err) {
          addError(err);
        }
      }
      loadCategoriesData();
    },
    [categories, coreApp, addError]
  );

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const paymentData = buildPaymentData({
        accountID,
        categoryID,
        amount,
        description,
        transactionDate,
      });
      await coreApp.createPayment(paymentData);
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
      <ModalToolbar title="New Payment" onClose={onClose} />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">Account:</IonLabel>
            <IonSelect
              value={accountID}
              onIonChange={(evt) => {
                setAccountID(evt.detail.value);
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
            <IonLabel position="stacked">Category:</IonLabel>
            <IonSelect
              value={categoryID}
              onIonChange={(evt) => {
                setCategoryID(evt.detail.value);
              }}
              placeholder="Category"
            >
              {(categories || [])
                .sort(sortByName)
                .map(({ id: catID, name }) => (
                  <IonSelectOption key={catID} value={catID}>
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
              value={transactionDate}
              onIonChange={(evt) => {
                setPaymentDate(evt.detail.value);
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
          <IonButton type="submit">Add Payment</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewPayment.propTypes = {
  coreApp: PropTypes.shape({
    createPayment: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
