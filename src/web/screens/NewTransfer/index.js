import React, { useState } from "react";
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
import useCoreAppData from "../../hooks/useCoreAppData";
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

export default function NewTransfer({ type, coreApp, onClose }) {
  const [amount, setAmount] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [description, setDescription] = useState(null);
  const [transferDate, setTransferDate] = useState(today());
  const [errors, addError, dismissErrors] = useErrors([]);

  const accounts = useCoreAppData({
    coreApp,
    initialValue: [],
    runOnce: true,
    dataLoadFunc: async (setAccounts) => {
      try {
        const allAccounts = await coreApp.getAccounts();
        setAccounts(allAccounts);

        const externalAccounts = allAccounts.filter(coreApp.isExternal);
        let internalAccounts = allAccounts.filter(coreApp.isInternal);

        // extend internalAccounts with commonly used fields
        internalAccounts = await coreApp.extendAccounts(internalAccounts, [
          "balance",
        ]);

        setAccounts([...internalAccounts, ...externalAccounts]);
      } catch (err) {
        addError(err);
      }
    },
  });

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const transferData = buildTransferData({
        from,
        to,
        amount,
        description,
        transferDate,
      });
      await coreApp.createTransfer(transferData);
      onClose();
    } catch (err) {
      addError(err);
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  const { label, fromFilter, toFilter } = {
    EXPENSE: {
      label: "Expense",
      fromFilter: coreApp.isInternal,
      toFilter: coreApp.isExternal,
    },
    INCOME: {
      label: "Income",
      fromFilter: coreApp.isExternal,
      toFilter: coreApp.isInternal,
    },
    TRANSFER: {
      label: "Transfer",
      fromFilter: coreApp.isInternal,
      toFilter: coreApp.isInternal,
    },
  }[type];

  return (
    <IonPage id="main-content">
      <ModalToolbar title={`New ${label}`} onClose={onClose} />
      <IonContent>
        <Errors errors={errors} onDismiss={dismissErrors} />
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={from}
              onIonChange={(evt) => {
                setFrom(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || [])
                .filter(fromFilter)
                .sort(sortByName)
                .map(({ id, name, balance }) => (
                  <IonSelectOption key={id} value={id}>
                    {name}
                    {balance ? ` ($${balance} available)` : ""}
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
              {(accounts || [])
                .filter(toFilter)
                .sort(sortByName)
                .map(({ id, name, balance }) => (
                  <IonSelectOption key={id} value={id}>
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
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Add {label}</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewTransfer.propTypes = {
  type: PropTypes.oneOf(["EXPENSE", "INCOME", "TRANSFER"]).isRequired,
  coreApp: PropTypes.shape({
    createTransfer: PropTypes.func.isRequired,
    getAccounts: PropTypes.func.isRequired,
    isExternal: PropTypes.func.isRequired,
    isInternal: PropTypes.func.isRequired,
    extendAccounts: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
