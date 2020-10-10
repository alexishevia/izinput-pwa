import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import useAsyncState from "../../hooks/useAsyncState";
import Validation from "../../../helpers/Validation";
import ModalToolbar from "../../ModalToolbar";

function buildcategoryData({ id, name }) {
  const categoryData = {
    id,
    name,
  };
  new Validation(categoryData, "name").required().string().notEmpty();
  return categoryData;
}

export default function Editcategory({ id, coreApp, onClose }) {
  const [name, setName] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [category] = useAsyncState({}, function* loadcategory() {
    try {
      yield coreApp.getCategory(id);
    } catch (err) {
      coreApp.newError(err);
    }
  });

  const nameVal = name ?? category?.name;

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  function handleDelete(evt) {
    evt.preventDefault();
    setDeleteAlertOpen(true);
  }

  async function handleDeleteConfirm() {
    try {
      setDeleteAlertOpen(false);
      await coreApp.deleteCategory(id);
      onClose();
    } catch (err) {
      coreApp.newError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const categoryData = buildcategoryData({
        id,
        name: nameVal,
      });
      await coreApp.updateCategory(categoryData);
      onClose();
    } catch (err) {
      coreApp.newError(err);
    }
  }

  const endButton = (
    <IonButton onClick={handleDelete}>
      <IonIcon icon={trashOutline} />
    </IonButton>
  );

  return (
    <IonPage id="main-content">
      <ModalToolbar
        title="Edit Category"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Category"
            message="Are you sure you want to delete this category?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">Name:</IonLabel>
            <IonInput
              type="text"
              value={nameVal}
              onIonChange={(evt) => {
                setName(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Update category</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

Editcategory.propTypes = {
  id: PropTypes.string.isRequired,
  coreApp: PropTypes.shape({
    deleteCategory: PropTypes.func.isRequired,
    getCategory: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
    updateCategory: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
