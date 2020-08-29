import React from "react";
import PropTypes from "prop-types";
import { IonContent, IonPage } from "@ionic/react";
import MainMenu from "./MainMenu";
import MainHeader from "./MainHeader";
import Errors from "./Errors";

export default function Page({ isSyncRunning, errors, removeError, children }) {
  return (
    <>
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
        </IonContent>
      </IonPage>
    </>
  );
}

Page.defaultProps = {
  isSyncRunning: false,
};

Page.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  isSyncRunning: PropTypes.bool,
  removeError: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
