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
  { name: "Transactions", route: "/transactions" },
  { name: "Trends", route: "/trends" },
  { name: "Forecast", route: "/forecast" },
  { name: "Accounts", route: "/accounts" },
  { name: "Categories", route: "/categories" },
  { name: "Settings", route: "/settings" },
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
