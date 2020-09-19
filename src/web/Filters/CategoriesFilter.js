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

export default function CategoriesFilter({
  categories,
  categoriesStatus,
  setStatusForCategory,
}) {
  return (
    <>
      <IonItemDivider className="ion-padding-top">
        <IonLabel color="primary">
          <h2>Categories</h2>
        </IonLabel>
      </IonItemDivider>
      {(categories || []).sort(sortByName).map(({ id, name }) => {
        const isActive = Object.hasOwnProperty.call(categoriesStatus, id)
          ? categoriesStatus[id]
          : true;
        return (
          <IonItem key={id}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={() => {
                setStatusForCategory(id, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

CategoriesFilter.defaultProps = {
  categories: [],
  categoriesStatus: {},
};

CategoriesFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({})),
  categoriesStatus: PropTypes.shape({}),
  setStatusForCategory: PropTypes.func.isRequired,
};
