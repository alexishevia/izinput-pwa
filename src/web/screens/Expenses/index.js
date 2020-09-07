import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import {
  chevronBackOutline,
  filterOutline,
  searchOutline,
} from "ionicons/icons";
import Errors from "../../Errors";
import useErrors from "../../hooks/useErrors";
import useAsyncState from "../../hooks/useAsyncState";
import ExpensesList from "./ExpensesList";
import { dateToDayStr, monthStart, monthEnd } from "../../../helpers/date";

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

function DateFilter({ fromDate, setFromDate, toDate, setToDate }) {
  return (
    <>
      <IonItemDivider>
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

function AccountsFilter({ accounts, accountsStatus, setStatusForAccount }) {
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

function CategoriesFilter({
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

export default function Expenses({ coreApp }) {
  const [fromDate, setFromDate] = useState(dateToDayStr(monthStart()));
  const [toDate, setToDate] = useState(dateToDayStr(monthEnd()));
  const [errors, addError, dismissErrors] = useErrors([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountsStatus, setAccountsStatus] = useState({});
  const [categoriesStatus, setCategoriesStatus] = useState({});
  const [searchText, setSearchText] = useState("");

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
        addError(err);
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
        addError(err);
      }
    }
  );

  function getActiveCategories() {
    return (categories || []).filter(
      ({ id }) => (categoriesStatus || {})[id] !== false
    );
  }

  const [expenses, reloadExpenses] = useAsyncState(
    [],
    function* loadExpenses() {
      try {
        const activeAccounts = getActiveAccounts();
        const accountIDs =
          activeAccounts.length !== accounts.length
            ? activeAccounts.map((acc) => acc.id)
            : null;
        const activeCategories = getActiveCategories();
        const categoryIDs =
          activeCategories.length !== categories.length
            ? activeCategories.map((cat) => cat.id)
            : null;
        yield coreApp.getExpenses({
          fromDate,
          toDate,
          orderBy: "transactionDate",
          reverse: true,
          accountIDs,
          categoryIDs,
        });
      } catch (err) {
        addError(err);
      }
    }
  );

  // reload data on coreApp.CHANGE_EVENT
  function reloadData() {
    reloadAccounts();
    reloadCategories();
    reloadExpenses();
  }
  useEffect(() => {
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
  }, [coreApp]);

  // reload expenses when filters change
  useEffect(
    function resetExpenses() {
      reloadExpenses();
    },
    [fromDate, toDate, accountsStatus, categoriesStatus]
  );

  return (
    <>
      <Errors errors={errors} onDismiss={dismissErrors} />
      <IonModal isOpen={isFiltersModalOpen}>
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
          <h3>Expenses</h3>
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
      <ExpensesList
        expenses={expenses.filter(filterBySearchText(searchText))}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}

Expenses.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getExpenses: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
  }).isRequired,
};
