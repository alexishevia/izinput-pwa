import React from "react";
import PropTypes from "prop-types";
import { IonContent, IonPage } from "@ionic/react";
import MainHeader from "./MainHeader";
import MainFab from "./MainFab";

export default function Screen({ children }) {
  return (
    <>
      <IonPage id="main-content">
        <IonContent>
          <MainHeader />
          {children}
          <MainFab />
        </IonContent>
      </IonPage>
    </>
  );
}

Screen.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
