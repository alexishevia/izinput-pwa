import React, { useState } from "react";
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
import useAsyncState from "../../hooks/useAsyncState";
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

function buildExpenseData({
  id,
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const expenseData = {
    id,
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

export default function EditExpense({ id, coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setExpenseDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [errors, addError, dismissErrors] = useErrors([]);

  const [accounts] = useAsyncState([], async function* loadAccounts() {
    try {
      const allAccounts = await coreApp.getAccounts();
      yield allAccounts;
      const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
        "balance",
      ]);
      yield extendedAccounts;
    } catch (err) {
      addError(err);
    }
  });

  const [categories] = useAsyncState([], function* loadCategories() {
    try {
      yield coreApp.getCategories();
    } catch (err) {
      addError(err);
    }
  });

  const [expense] = useAsyncState({}, function* loadExpense() {
    try {
      yield coreApp.getExpense(id);
    } catch (err) {
      addError(err);
    }
  });

  const amountVal = amount ?? expense?.amount;
  const accountIDVal =
    accountID ??
    (accounts || []).find((acct) => acct.id === expense?.accountID)?.id;
  const categoryIDVal =
    categoryID ??
    (categories || []).find((cat) => cat.id === expense?.categoryID)?.id;
  const descriptionVal = description ?? expense?.description;
  const transactionDateVal = transactionDate ?? expense?.transactionDate;

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
      await coreApp.deleteExpense(id);
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const expenseData = buildExpenseData({
        id: expense.id,
        accountID: accountIDVal,
        categoryID: categoryIDVal,
        amount: amountVal,
        description: descriptionVal,
        transactionDate: transactionDateVal,
      });
      await coreApp.updateExpense(expenseData);
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
        title="Edit Expense"
        color="danger"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Expense"
            message="Are you sure you want to delete this expense?"
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
                setExpenseDate(evt.detail.value);
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
          <IonButton color="danger" type="submit">
            Update Expense
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditExpense.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    deleteExpense: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getExpense: PropTypes.func.isRequired,
    updateExpense: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
