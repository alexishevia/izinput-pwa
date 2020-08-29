import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonAlert,
} from "@ionic/react";
import { dateToDayStr, isValidDayStr } from "../../../helpers/date";
import Validation from "../../../helpers/Validation";

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

export default function EditTransfer({
  transfer,
  editTransfer,
  accounts,
  onDelete,
  onCancel,
  newError,
}) {
  const [amount, setAmount] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [description, setDescription] = useState(null);
  const [transferDate, setTransferDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useMemo(
    function resetState() {
      setAmount(null);
      setFrom(null);
      setTo(null);
      setDescription(null);
      setTransferDate(null);
    },
    [transfer.id]
  );

  const amountVal = amount === null ? transfer.amount : amount;
  const fromVal = from === null ? transfer.from : from;
  const toVal = to === null ? transfer.to : to;
  const descriptionVal =
    description === null ? transfer.description : description;
  const transferDateVal =
    transferDate === null ? transfer.transferDate : transferDate;

  function handleCancel(evt) {
    evt.preventDefault();
    onCancel();
  }

  function handleDelete(evt) {
    evt.preventDefault();
    setDeleteAlertOpen(true);
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
      await editTransfer(transferData);
    } catch (err) {
      newError(err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <IonAlert
        isOpen={isDeleteAlertOpen}
        onDidDismiss={() => setDeleteAlertOpen(false)}
        header="Delete Transfer"
        message="Are you sure you want to delete this transfer?"
        buttons={[
          { text: "Cancel", role: "cancel" },
          { text: "Delete", handler: onDelete },
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
          value={toVal}
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
      <IonButton type="submit">Update</IonButton>
      <IonButton color="danger" onClick={handleDelete}>
        Delete
      </IonButton>
      <IonButton color="medium" onClick={handleCancel}>
        Cancel
      </IonButton>
    </form>
  );
}

EditTransfer.propTypes = {
  transfer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    transferDate: PropTypes.string.isRequired,
  }).isRequired,
  editTransfer: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
