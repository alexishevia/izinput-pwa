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
import useAsyncState from "../../hooks/useAsyncState";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";
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
  id,
  fromID,
  toID,
  amount,
  description,
  transactionDate,
}) {
  const transferData = {
    id,
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

export default function EditTransfer({ id, coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [fromID, setFromID] = useState(null);
  const [toID, setToID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setTransferDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [accounts] = useAsyncState([], async function* loadAccounts() {
    try {
      const allAccounts = await coreApp.getAccounts();
      yield allAccounts;
      const extendedAccounts = await coreApp.extendAccounts(allAccounts, [
        "balance",
      ]);
      yield extendedAccounts;
    } catch (err) {
      coreApp.newError(err);
    }
  });

  const [transfer] = useAsyncState({}, function* loadTransfer() {
    try {
      yield coreApp.getTransfer(id);
    } catch (err) {
      coreApp.newError(err);
    }
  });

  const amountVal = amount ?? transfer?.amount;
  const fromIDVal =
    fromID ?? (accounts || []).find((acct) => acct.id === transfer?.fromID)?.id;
  const toIDVal =
    toID ?? (accounts || []).find((acct) => acct.id === transfer?.toID)?.id;
  const descriptionVal = description ?? transfer?.description;
  const transactionDateVal = transactionDate ?? transfer?.transactionDate;

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
      await coreApp.deleteTransfer(id);
      onClose();
    } catch (err) {
      coreApp.newError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        id: transfer.id,
        fromID: fromIDVal,
        toID: toIDVal,
        amount: amountVal,
        description: descriptionVal,
        transactionDate: transactionDateVal,
      });
      await coreApp.updateTransfer(transferData);
      onClose();
    } catch (err) {
      coreApp.newError(err);
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
        title="Edit Transfer"
        color="tertiary"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Transfer"
            message="Are you sure you want to delete this transfer?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={fromIDVal}
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
              value={toIDVal}
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
                setTransferDate(evt.detail.value);
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
          <IonButton type="submit" color="tertiary">
            Update Transfer
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditTransfer.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    deleteTransfer: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getTransfer: PropTypes.func.isRequired,
    updateTransfer: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
