import React from "react";
import {
  IonFab,
  IonFabButton,
  IonButton,
  IonIcon,
  IonFabList,
  IonLabel,
} from "@ionic/react";
import { add } from "ionicons/icons";

const buttons = [
  { name: "Account", route: "/newAccount" },
  { name: "Transfer", route: "/newTransfer", color: "tertiary" },
  { name: "Income", route: "/newIncome", color: "success" },
  { name: "Expense", route: "/newExpense", color: "danger" },
];

export default function MainFab() {
  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton>
        <IonIcon icon={add} />
      </IonFabButton>
      <IonFabList side="top">
        <div className="ion-text-end" style={{ marginLeft: "-5em" }}>
          {buttons.map(({ name, route, color }) => (
            <IonButton
              style={{ minWidth: "8em" }}
              key={name}
              routerLink={route}
              color={color}
            >
              <IonLabel>{name}</IonLabel>
            </IonButton>
          ))}
        </div>
      </IonFabList>
    </IonFab>
  );
}
