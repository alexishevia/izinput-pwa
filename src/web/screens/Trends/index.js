import React from "react";
import PropTypes from "prop-types";
import IncomeVsExpenses from "./IncomeVsExpenses";

export default function Trends({ coreApp }) {
  return (
    <>
      <IncomeVsExpenses coreApp={coreApp} />
    </>
  );
}

Trends.propTypes = {
  coreApp: PropTypes.shape({}).isRequired,
};
