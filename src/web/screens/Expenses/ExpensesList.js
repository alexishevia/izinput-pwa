import React from "react";
import PropTypes from "prop-types";
import { IonList } from "@ionic/react";
import Expense from "../../Expense";

function ExpensesList({ expenses, accounts, categories }) {
  if (!expenses.length) {
    return null;
  }

  return (
    <IonList>
      {expenses.map((expense) => (
        <Expense
          key={expense.id}
          expense={expense}
          accounts={accounts}
          categories={categories}
        />
      ))}
    </IonList>
  );
}

ExpensesList.propTypes = {
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
  expenses: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default ExpensesList;
