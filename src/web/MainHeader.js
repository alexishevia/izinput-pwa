import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";

export default function MainHeader() {
  return (
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>
        <IonTitle>Invoice Zero</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
}
