import React from "react";
import PropTypes from "prop-types";
import IncomeVsExpenses from "./IncomeVsExpenses";
import ExpensesByMonth from "./ExpensesByMonth";

export default function Trends({ coreApp }) {
  return (
    <>
      <IncomeVsExpenses coreApp={coreApp} />
      <ExpensesByMonth coreApp={coreApp} />
    </>
  );
}

Trends.propTypes = {
  coreApp: PropTypes.shape({}).isRequired,
};
