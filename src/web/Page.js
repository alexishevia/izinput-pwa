import React from "react";
import PropTypes from "prop-types";
import { IonContent, IonPage } from "@ionic/react";
import MainMenu from "./MainMenu";
import MainHeader from "./MainHeader";
import Errors from "./Errors";

export default function Page({ isSyncRunning, errors, removeError, children }) {
  return (
    <div>
      <MainMenu />
      <IonPage id="main-content">
        <MainHeader />
        <IonContent className="ion-padding">
          {isSyncRunning ? (
            <div style={{ backgroundColor: "#eee", marginBottom: "1em" }}>
              syncing...
            </div>
          ) : null}
          <Errors errors={errors} removeError={removeError} />
          {children}
        </IonContent>
      </IonPage>
    </div>
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
