import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import useErrors from "../../hooks/useErrors";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";
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
  id,
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const paymentData = {
    id,
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

export default function EditPayment({ id, coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setPaymentDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [errors, addError, dismissErrors] = useErrors([]);
  const [accounts, setAccounts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [payment, setPayment] = useState(null);

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

  useEffect(
    function loadPayment() {
      if (payment !== null) {
        return;
      }
      setPayment({});
      async function loadPaymentData() {
        try {
          const paymentData = await coreApp.getPayment(id);
          setPayment(paymentData);
        } catch (err) {
          addError(err);
        }
      }
      loadPaymentData();
    },
    [payment, coreApp, id, addError]
  );

  useEffect(
    function resetFormData() {
      setAmount(null);
      setAccountID(null);
      setCategoryID(null);
      setDescription(null);
      setPaymentDate(null);
      setDeleteAlertOpen(false);
    },
    [id]
  );

  const amountVal = amount ?? payment?.amount;
  const accountIDVal =
    accountID ??
    (accounts || []).find((acct) => acct.id === payment?.accountID)?.id;
  const categoryIDVal =
    categoryID ??
    (categories || []).find((cat) => cat.id === payment?.categoryID)?.id;
  const descriptionVal = description ?? payment?.description;
  const transactionDateVal = transactionDate ?? payment?.transactionDate;

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  function handleDelete(evt) {
    evt.preventDefault();
    setDeleteAlertOpen(true);
  }

  async function handleDeleteConfirm() {
    try {
      setDeleteAlertOpen(false);
      await coreApp.deletePayment(id);
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const paymentData = buildPaymentData({
        id: payment.id,
        accountID: accountIDVal,
        categoryID: categoryIDVal,
        amount: amountVal,
        description: descriptionVal,
        transactionDate: transactionDateVal,
      });
      await coreApp.updatePayment(paymentData);
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  const endButton = (
    <IonButton onClick={handleDelete}>
      <IonIcon icon={trashOutline} />
    </IonButton>
  );

  return (
    <IonPage id="main-content">
      <ModalToolbar
        title="Edit Payment"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Payment"
            message="Are you sure you want to delete this payment?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">Account:</IonLabel>
            <IonSelect
              value={accountIDVal}
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
              value={categoryIDVal}
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
              value={amountVal}
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
              value={transactionDateVal}
              onIonChange={(evt) => {
                setPaymentDate(evt.detail.value);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description:</IonLabel>
            <IonInput
              type="text"
              value={descriptionVal}
              onIonChange={(evt) => {
                setDescription(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Update Payment</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditPayment.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    deletePayment: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getPayment: PropTypes.func.isRequired,
    updatePayment: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
