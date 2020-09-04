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

function buildExpenseData({
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const expenseData = {
    accountID,
    categoryID,
    amount: parseFloat(amount, 10),
    description,
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(expenseData, "accountID").required().string().notEmpty();
  new Validation(expenseData, "categoryID").required().string().notEmpty();
  new Validation(expenseData, "amount").required().number().biggerThan(0);
  new Validation(expenseData, "description").required().string();
  new Validation(expenseData, "transactionDate").required().dayString();

  return expenseData;
}

export default function NewExpense({ coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setExpenseDate] = useState(today());
  const [errors, addError, dismissErrors] = useErrors([]);
  const [accounts, setAccounts] = useState(null);
  const [categories, setCategories] = useState(null);

  function resetFormData() {
    setAmount(null);
    setAccountID(null);
    setCategoryID(null);
    setDescription(null);
    setExpenseDate(today());
    setAccounts(null);
    setCategories(null);
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
      const expenseData = buildExpenseData({
        accountID,
        categoryID,
        amount,
        description,
        transactionDate,
      });
      await coreApp.createExpense(expenseData);
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
      <ModalToolbar title="New Expense" onClose={onClose} color="danger" />
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
                setExpenseDate(evt.detail.value);
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
          <IonButton type="submit" color="danger">
            Add Expense
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewExpense.propTypes = {
  coreApp: PropTypes.shape({
    createExpense: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
