import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonButton, IonLoading } from "@ionic/react";
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
        write({ TYPE: "ACCOUNT", ...data });
      });
      await localDB.dexie.categories.each((data) => {
        write({ TYPE: "CATEGORY", ...data });
      });
      await localDB.dexie.incomes.each((data) => {
        write({ TYPE: "INCOME", ...data });
      });
      await localDB.dexie.expenses.each((data) => {
        write({ TYPE: "EXPENSE", ...data });
      });
      await localDB.dexie.transfers.each((data) => {
        write({ TYPE: "TRANSFER", ...data });
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
