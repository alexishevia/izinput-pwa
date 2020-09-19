import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonItemDivider, IonLabel, IonToggle } from "@ionic/react";

export default function TypesFilter({ types, setStatusForType }) {
  return (
    <>
      <IonItemDivider>
        <IonLabel color="primary">
          <h2>Transaction Type</h2>
        </IonLabel>
      </IonItemDivider>
      {[
        { name: "Expense", value: "EXPENSE" },
        { name: "Income", value: "INCOME" },
        { name: "Transfer", value: "TRANSFER" },
      ].map(({ name, value }) => {
        const isActive = types.includes(value);
        return (
          <IonItem key={value}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={() => {
                setStatusForType(value, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

TypesFilter.propTypes = {
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  setStatusForType: PropTypes.func.isRequired,
};
