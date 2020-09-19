import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  chevronBackOutline,
  filterOutline,
  searchOutline,
} from "ionicons/icons";
import useAsyncState from "../../hooks/useAsyncState";
import TransactionsList from "../../TransactionsList";
import { dateToDayStr, monthStart, monthEnd } from "../../../helpers/date";
import TypesFilter from "../../Filters/TypesFilter";
import DateFilter from "../../Filters/DateFilter";
import AccountsFilter from "../../Filters/AccountsFilter";
import CategoriesFilter from "../../Filters/CategoriesFilter";

function filterBySearchText(searchText) {
  return function filter({ amount, description }) {
    if (!searchText) {
      return true;
    }
    if (`${amount}`.includes(searchText)) {
      return true;
    }
    if (description.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
    return false;
  };
}

function unique(arr) {
  return Array.from(new Set(arr));
}

export default function Transactions({ coreApp }) {
  const [types, setTypes] = useState(["INCOME", "EXPENSE", "TRANSFER"]);
  const [fromDate, setFromDate] = useState(dateToDayStr(monthStart()));
  const [toDate, setToDate] = useState(dateToDayStr(monthEnd()));
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountsStatus, setAccountsStatus] = useState({});
  const [categoriesStatus, setCategoriesStatus] = useState({});
  const [searchText, setSearchText] = useState("");

  function setStatusForType(type, isActive) {
    setTypes((prevTypes) =>
      isActive
        ? unique([...prevTypes, type])
        : prevTypes.filter((t) => t !== type)
    );
  }

  function setStatusForAccount(id, isActive) {
    setAccountsStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function setStatusForCategory(id, isActive) {
    setCategoriesStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function handleOpenFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(true);
  }

  function handleCloseFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(false);
  }

  function handleToggleSearch(evt) {
    evt.preventDefault();
    setIsSearchOpen((val) => !val);
  }

  const [accounts, reloadAccounts] = useAsyncState(
    [],
    function* loadAccounts() {
      try {
        yield coreApp.getAccounts();
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  function getActiveAccounts() {
    return (accounts || []).filter(
      ({ id }) => (accountsStatus || {})[id] !== false
    );
  }

  const [categories, reloadCategories] = useAsyncState(
    [],
    function* loadCategories() {
      try {
        yield coreApp.getCategories();
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  function getActiveCategories() {
    return (categories || []).filter(
      ({ id }) => (categoriesStatus || {})[id] !== false
    );
  }

  const [transactions, reloadTransactions] = useAsyncState(
    [],
    function* loadTransactions() {
      try {
        const accountIDs = getActiveAccounts().map((acc) => acc.id);
        const categoryIDs = getActiveCategories().map((cat) => cat.id);
        yield coreApp.getTransactions({
          types,
          fromDate,
          toDate,
          orderBy: "transactionDate",
          reverse: true,
          accountIDs,
          categoryIDs,
        });
      } catch (err) {
        coreApp.newError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  useEffect(() => {
    function reloadData() {
      reloadAccounts();
      reloadCategories();
      reloadTransactions();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload transactions when filters change
  useEffect(() => {
    reloadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    types,
    fromDate,
    toDate,
    accounts,
    accountsStatus,
    categories,
    categoriesStatus,
  ]);

  return (
    <>
      <IonModal
        isOpen={isFiltersModalOpen}
        onDidDismiss={() => setIsFiltersModalOpen(false)}
      >
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleCloseFiltersModal}>
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Filters</IonTitle>
        </IonToolbar>
        <IonContent>
          <IonList>
            <TypesFilter types={types} setStatusForType={setStatusForType} />
            <DateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
            <AccountsFilter
              accounts={accounts}
              accountsStatus={accountsStatus}
              setStatusForAccount={setStatusForAccount}
            />
            <CategoriesFilter
              categories={categories}
              categoriesStatus={categoriesStatus}
              setStatusForCategory={setStatusForCategory}
            />
          </IonList>
        </IonContent>
      </IonModal>
      <IonItem>
        <IonLabel>
          <h3>Transactions</h3>
        </IonLabel>
        <IonButton fill="clear" slot="end" onClick={handleToggleSearch}>
          <IonIcon icon={searchOutline} />
        </IonButton>
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      {isSearchOpen ? (
        <IonSearchbar
          value={searchText}
          onIonChange={(e) => setSearchText(e.detail.value)}
        />
      ) : null}
      <TransactionsList
        transactions={transactions.filter(filterBySearchText(searchText))}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}

Transactions.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getTransactions: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
