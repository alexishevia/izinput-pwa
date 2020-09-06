import React from "react";
import PropTypes from "prop-types";
import { IonList } from "@ionic/react";
import Income from "../../Income";

function IncomeList({ income, accounts, categories }) {
  if (!income.length) {
    return null;
  }

  return (
    <IonList>
      {income.map((inc) => (
        <Income
          key={inc.id}
          income={inc}
          accounts={accounts}
          categories={categories}
        />
      ))}
    </IonList>
  );
}

IncomeList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  income: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default IncomeList;
