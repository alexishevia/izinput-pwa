import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonButton, IonLoading } from "@ionic/react";
import { v1 as uuid } from "uuid";
import DangerArea from "./DangerArea";
import Sync from "./Sync";

function writer(stream) {
  const encoder = new TextEncoder();
  return function write(obj) {
    const str = JSON.stringify(obj);
    stream.write(encoder.encode(str));
    stream.write(encoder.encode("\n"));
  };
}

export default function Settings({ coreApp }) {
  const [isLoading, setIsLoading] = useState(false);

  async function exportData(evt) {
    evt.preventDefault();
    try {
      setIsLoading(true);
      const fileStream = window.streamSaver
        .createWriteStream("invoicezero.ndjson")
        .getWriter();
      const write = writer(fileStream);
      const localDB = await coreApp.getLocalDB();

      await localDB.dexie.accounts.each((data) => {
        write({
          id: uuid(),
          type: "accounts/create",
          payload: {
            id: data.id,
            name: data.name,
            initialBalance: data.initialBalance * 100,
          },
        });
      });
      await localDB.dexie.categories.each((data) => {
        if (data.deleted) {
          return;
        }
        write({
          id: uuid(),
          type: "categories/create",
          payload: {
            id: data.id,
            name: data.name,
          },
        });
      });
      await localDB.dexie.incomes.each((data) => {
        if (data.deleted) {
          return;
        }
        write({
          id: uuid(),
          type: "income/create",
          payload: {
            id: data.id,
            amount: data.amount * 100,
            accountID: data.accountID,
            categoryID: data.categoryID,
            description: data.description,
            transactionDate: data.transactionDate,
          },
        });
      });
      await localDB.dexie.expenses.each((data) => {
        if (data.deleted) {
          return;
        }
        write({
          id: uuid(),
          type: "expenses/create",
          payload: {
            id: data.id,
            amount: data.amount * 100,
            accountID: data.accountID,
            categoryID: data.categoryID,
            description: data.description,
            transactionDate: data.transactionDate,
          },
        });
      });
      await localDB.dexie.transfers.each((data) => {
        if (data.deleted) {
          return;
        }
        write({
          id: uuid(),
          type: "transfers/create",
          payload: {
            id: data.id,
            amount: data.amount * 100,
            fromID: data.fromID,
            toID: data.toID,
            transactionDate: data.transactionDate,
          },
        });
      });

      setIsLoading(false);
      fileStream.close();
    } catch (err) {
      setIsLoading(false);
      coreApp.newError(err);
    }
  }

  return (
    <>
      <IonLoading isOpen={isLoading} />
      <Sync coreApp={coreApp} />
      <DangerArea coreApp={coreApp} />
      <IonButton onClick={exportData}>Export Data</IonButton>
    </>
  );
}

Settings.propTypes = {
  coreApp: PropTypes.shape({
    getLocalDB: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
