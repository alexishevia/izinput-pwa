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
import useAsyncState from "../../hooks/useAsyncState";
import TransfersList from "./TransfersList";
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

export default function Transfers({ coreApp }) {
  const [fromDate, setFromDate] = useState(dateToDayStr(monthStart()));
  const [toDate, setToDate] = useState(dateToDayStr(monthEnd()));
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountsStatus, setAccountsStatus] = useState({});
  const [searchText, setSearchText] = useState("");

  function setStatusForAccount(id, isActive) {
    setAccountsStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
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

  const [transfers, reloadTransfers] = useAsyncState(
    [],
    function* loadTransfers() {
      try {
        const activeAccounts = getActiveAccounts();
        const accountIDs =
          activeAccounts.length !== accounts.length
            ? activeAccounts.map((acc) => acc.id)
            : null;
        yield coreApp.getTransfers({
          fromDate,
          toDate,
          orderBy: "transactionDate",
          reverse: true,
          accountIDs,
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
      reloadTransfers();
    }
    coreApp.on(coreApp.CHANGE_EVENT, reloadData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, reloadData);
  }, []);

  // reload transfers when filters change
  useEffect(() => {
    reloadTransfers();
  }, []);

  return (
    <>
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
          </IonList>
        </IonContent>
      </IonModal>
      <IonItem>
        <IonLabel>
          <h3>Transfers</h3>
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
      <TransfersList
        transfers={transfers.filter(filterBySearchText(searchText))}
        accounts={accounts}
      />
    </>
  );
}

Transfers.propTypes = {
  coreApp: PropTypes.shape({
    CHANGE_EVENT: PropTypes.string.isRequired,
    getAccounts: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    getTransfers: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    newError: PropTypes.func.isRequired,
  }).isRequired,
};
