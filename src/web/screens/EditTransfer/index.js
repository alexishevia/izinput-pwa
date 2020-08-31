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
import useCoreAppData from "../../hooks/useCoreAppData";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";
import Errors from "../../Errors";
import ModalToolbar from "../../ModalToolbar";

function today() {
  return dateToDayStr(new Date());
}

function buildTransferData({
  id,
  from,
  to,
  amount,
  description,
  transferDate,
}) {
  const transferData = {
    id,
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

export default function EditTransfer({ id, coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [description, setDescription] = useState(null);
  const [transferDate, setTransferDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [errors, addError, dismissErrors] = useErrors([]);

  const accounts = useCoreAppData({
    coreApp,
    initialValue: [],
    runOnce: true,
    dataLoadFunc: async (setAccounts) => {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);
      } catch (err) {
        addError(err);
      }
    },
  });

  const transfer = useCoreAppData({
    coreApp,
    initialValue: {},
    runOnce: true,
    dataLoadFunc: async (setTransfer) => {
      try {
        const transferData = await coreApp.getTransfer(id);
        setTransfer(transferData);
      } catch (err) {
        addError(err);
      }
    },
  });

  useEffect(
    function resetFormData() {
      setAmount(null);
      setFrom(null);
      setTo(null);
      setDescription(null);
      setTransferDate(null);
      setDeleteAlertOpen(false);
    },
    [id]
  );

  const amountVal = amount ?? transfer.amount;
  const fromVal = from ?? transfer.from;
  const toVal = to ?? transfer.to;
  const descriptionVal = description ?? transfer.description;
  const transferDateVal = transferDate ?? transfer.transferDate;

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
      addError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        id: transfer.id,
        from: fromVal,
        to: toVal,
        amount: amountVal,
        description: descriptionVal,
        transferDate: transferDateVal,
      });
      await coreApp.updateTransfer(transferData);
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
        title="Edit Transfer"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
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
              value={fromVal}
              onIonChange={(evt) => {
                setFrom(evt.detail.value);
              }}
              placeholder="Account"
            >
              {accounts.map(({ id: accID, name }) => (
                <IonSelectOption key={accID} value={accID}>
                  {name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">To:</IonLabel>
            <IonSelect
              value={toVal}
              onIonChange={(evt) => {
                setTo(evt.detail.value);
              }}
              placeholder="Account"
            >
              {accounts.map(({ id: accID, name }) => (
                <IonSelectOption key={accID} value={accID}>
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
              value={transferDateVal}
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
          <IonButton type="submit">Update Transfer</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditTransfer.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    getAccounts: PropTypes.func.isRequired,
    getTransfer: PropTypes.func.isRequired,
    updateTransfer: PropTypes.func.isRequired,
    deleteTransfer: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
