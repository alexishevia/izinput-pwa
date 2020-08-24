import React from "react";
import PropTypes from "prop-types";
import { IonList, IonListHeader, IonItem, IonLabel } from "@ionic/react";

function sortByModifiedAt(a, b) {
  if (a.modifiedAt > b.modifiedAt) {
    return -1;
  }
  if (b.modifiedAt > a.modifiedAt) {
    return 1;
  }
  return 0;
}

function capitalize([initialChar, ...rest]) {
  return [initialChar.toUpperCase(), ...rest.map((c) => c.toLowerCase())].join(
    ""
  );
}

export default function AccountsList({ accounts, onSelect }) {
  if (!accounts.length) {
    return null;
  }
  return (
    <IonList>
      <IonListHeader>
        <IonLabel>
          <h1>Accounts</h1>
        </IonLabel>
      </IonListHeader>
      {accounts
        .sort(sortByModifiedAt)
        .map(({ id, name, type, initialBalance }) => {
          const typeLabel = capitalize(type);
          return (
            <IonItem key={id} onClick={() => onSelect(id)}>
              <IonLabel>
                <h2>{name}</h2>
                <p>
                  {typeLabel}
                  {type === "INTERNAL"
                    ? `, Initial Balance: ${initialBalance}`
                    : ""}
                </p>
              </IonLabel>
            </IonItem>
          );
        })}
    </IonList>
  );
}

AccountsList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      initialBalance: PropTypes.number,
    })
  ).isRequired,
};
