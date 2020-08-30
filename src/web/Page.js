import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonButton,
  IonIcon,
  IonFabList,
  IonLabel,
} from "@ionic/react";
import { add } from "ionicons/icons";
import MainMenu from "./MainMenu";
import MainHeader from "./MainHeader";
import Errors from "./Errors";
import NewTransfer from "./Transfers/NewTransfer";

export default function Page({
  coreApp,
  accounts,
  isSyncRunning,
  onError,
  errors,
  removeError,
  children,
}) {
  const [activeModal, setActiveModal] = useState(null);

  function onModalCancel() {
    setActiveModal(null);
  }

  async function handleNewTranfer(transferData) {
    try {
      setActiveModal(null);
      await coreApp.createTransfer(transferData);
    } catch (err) {
      onError(err);
    }
  }

  const modals = {
    NewTransfer: () => (
      <NewTransfer
        accounts={accounts}
        newTransfer={handleNewTranfer}
        onCancel={onModalCancel}
        onError={onError}
      />
    ),
  };

  const ModalToRender = activeModal ? modals[activeModal] : null;

  return (
    <>
      {ModalToRender ? <ModalToRender /> : null}
      <MainMenu />
      <IonPage id="main-content">
        <MainHeader />
        <IonContent>
          {isSyncRunning ? (
            <div style={{ backgroundColor: "#eee", marginBottom: "1em" }}>
              syncing...
            </div>
          ) : null}
          <Errors errors={errors} removeError={removeError} />
          {children}
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton>
              <IonIcon icon={add} />
            </IonFabButton>
            <IonFabList side="top">
              <div className="ion-text-end" style={{ marginLeft: "-5em" }}>
                <IonButton onClick={() => setActiveModal("NewTransfer")}>
                  <IonLabel>Account</IonLabel>
                </IonButton>
                <IonButton onClick={() => setActiveModal("NewTransfer")}>
                  <IonLabel>Transfer</IonLabel>
                </IonButton>
                <IonButton onClick={() => setActiveModal("NewTransfer")}>
                  <IonLabel>Income</IonLabel>
                </IonButton>
                <IonButton onClick={() => setActiveModal("NewTransfer")}>
                  <IonLabel>Expense</IonLabel>
                </IonButton>
              </div>
            </IonFabList>
          </IonFab>
        </IonContent>
      </IonPage>
    </>
  );
}

Page.defaultProps = {
  isSyncRunning: false,
};

Page.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  coreApp: PropTypes.shape({
    createTransfer: PropTypes.func.isRequired,
  }).isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  isSyncRunning: PropTypes.bool,
  onError: PropTypes.func.isRequired,
  removeError: PropTypes.func.isRequired,
};
