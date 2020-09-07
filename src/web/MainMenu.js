import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenu,
  IonMenuToggle,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";

const routes = [
  { name: "Home", route: "/" },
  { name: "Expenses", route: "/expenses" },
  { name: "Income", route: "/income" },
  { name: "Transfers", route: "/transfers" },
  { name: "Accounts", route: "/accounts" },
  { name: "Sync", route: "/sync" },
];

export default function MainMenu() {
  return (
    <IonMenu side="start" content-id="main-content">
      <IonHeader>
        <IonToolbar translucent>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonMenuToggle>
            {routes.map(({ name, route }) => (
              <IonItem key={route} routerLink={route}>
                <IonLabel>{name}</IonLabel>
              </IonItem>
            ))}
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
}
