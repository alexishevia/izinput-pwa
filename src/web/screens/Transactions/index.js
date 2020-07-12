import React from "react";
import NewTransaction from "./NewTransaction";
import TransactionsList from "./TransactionsList";

export default function Transactions() {
  return (
    <div>
      <NewTransaction />
      <TransactionsList
        onSelectTransaction={() => {
          /* do nothing */
        }}
      />
    </div>
  );
}
