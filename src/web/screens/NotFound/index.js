import React from "react";
import { IonLabel } from "@ionic/react";

export default function NotFound() {
  return (
    <div className="ion-padding">
      <IonLabel>
        <h2>Error</h2>
        <p>Screen not found.</p>
      </IonLabel>
    </div>
  );
}
