import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel, IonNote } from "@ionic/react";

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

function Category({ category }) {
  const { id, name } = category;
  return (
    <IonItem button routerLink={`/editCategory/${id}`}>
      <IonLabel>
        <p>
          <IonNote color="primary">{name}</IonNote>
        </p>
      </IonLabel>
    </IonItem>
  );
}

Category.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

function CategoriesList({ categories }) {
  if (!categories.length) {
    return null;
  }

  return (
    <IonList className="TransactionsList">
      {categories.sort(sortByName).map((category) => (
        <Category key={category.id} category={category} />
      ))}
    </IonList>
  );
}

CategoriesList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default CategoriesList;
