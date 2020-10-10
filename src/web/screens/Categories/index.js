import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import useAsyncState from "../../hooks/useAsyncState";
import CategoriesList from "./CategoriesList";

export default function Categories({ coreApp }) {
  window.coreApp = coreApp;
  const [categories, reloadCategories] = useAsyncState(
    [],
    async function* loadCategories() {
      try {
        const cats = await coreApp.getCategories();
        yield cats;
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  useEffect(() => {
    coreApp.on(coreApp.CHANGE_EVENT, reloadCategories);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Categories</h3>
        </IonLabel>
      </IonItem>
      <CategoriesList categories={categories} />
    </>
  );
}

Categories.propTypes = {
  coreApp: PropTypes.shape({
    getCategories: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    CHANGE_EVENT: PropTypes.string.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
