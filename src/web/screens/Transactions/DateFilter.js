import React from "react";
import PropTypes from "prop-types";
import { IonDatetime, IonItem, IonItemDivider, IonLabel } from "@ionic/react";

export default function DateFilter({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {
  return (
    <>
      <IonItemDivider className="ion-padding-top">
        <IonLabel color="primary">
          <h2>Transaction Date</h2>
        </IonLabel>
      </IonItemDivider>
      <IonItem>
        <IonLabel position="stacked">from:</IonLabel>
        <IonDatetime
          value={fromDate}
          onIonChange={(evt) => {
            setFromDate(evt.detail.value);
          }}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">to:</IonLabel>
        <IonDatetime
          value={toDate}
          onIonChange={(evt) => {
            setToDate(evt.detail.value);
          }}
        />
      </IonItem>
    </>
  );
}

DateFilter.propTypes = {
  fromDate: PropTypes.string.isRequired,
  setFromDate: PropTypes.func.isRequired,
  toDate: PropTypes.string.isRequired,
  setToDate: PropTypes.func.isRequired,
};
