import React from "react";
import PropTypes from "prop-types";
import { IonContent, IonPage } from "@ionic/react";
import MainMenu from "./MainMenu";
import MainHeader from "./MainHeader";
import MainFab from "./MainFab";

export default function Screen({ isSyncRunning, children }) {
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
          {children}
          <MainFab />
        </IonContent>
      </IonPage>
    </>
  );
}

Screen.defaultProps = {
  isSyncRunning: false,
};

Screen.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  isSyncRunning: PropTypes.bool,
};
