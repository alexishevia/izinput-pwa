import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonItemDivider, IonLabel, IonToggle } from "@ionic/react";

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export default function AccountsFilter({
  accounts,
  accountsStatus,
  setStatusForAccount,
}) {
  return (
    <>
      <IonItemDivider className="ion-padding-top">
        <IonLabel color="primary">
          <h2>Accounts</h2>
        </IonLabel>
      </IonItemDivider>
      {(accounts || []).sort(sortByName).map(({ id, name }) => {
        const isActive = Object.hasOwnProperty.call(accountsStatus, id)
          ? accountsStatus[id]
          : true;
        return (
          <IonItem key={id}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={() => {
                setStatusForAccount(id, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

AccountsFilter.defaultProps = {
  accounts: [],
  accountsStatus: {},
};

AccountsFilter.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape({})),
  accountsStatus: PropTypes.shape({}),
  setStatusForAccount: PropTypes.func.isRequired,
};
