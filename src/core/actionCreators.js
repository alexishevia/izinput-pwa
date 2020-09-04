export function AccountsCreateAction(values) {
  return {
    version: 1,
    type: "accounts/create",
    payload: values,
  };
}

export function AccountsUpdateAction(values) {
  return {
    version: 1,
    type: "accounts/update",
    payload: values,
  };
}

export function IncomesCreateAction(values) {
  return {
    version: 1,
    type: "incomes/create",
    payload: values,
  };
}

export function IncomesUpdateAction(values) {
  return {
    version: 1,
    type: "incomes/update",
    payload: values,
  };
}

export function IncomesDeleteAction({ id, modifiedAt }) {
  return {
    version: 1,
    type: "incomes/delete",
    payload: { id, modifiedAt },
  };
}

export function ExpensesCreateAction(values) {
  return {
    version: 1,
    type: "expenses/create",
    payload: values,
  };
}

export function ExpensesUpdateAction(values) {
  return {
    version: 1,
    type: "expenses/update",
    payload: values,
  };
}

export function ExpensesDeleteAction({ id, modifiedAt }) {
  return {
    version: 1,
    type: "expenses/delete",
    payload: { id, modifiedAt },
  };
}

export function TransfersCreateAction(values) {
  return {
    version: 1,
    type: "transfers/create",
    payload: values,
  };
}

export function TransfersUpdateAction(values) {
  return {
    version: 1,
    type: "transfers/update",
    payload: values,
  };
}

export function TransfersDeleteAction({ id, modifiedAt }) {
  return {
    version: 1,
    type: "transfers/delete",
    payload: { id, modifiedAt },
  };
}

export function CategoriesCreateAction(name) {
  return {
    version: 1,
    type: "categories/create",
    payload: name,
  };
}

export function CategoriesDeleteAction(id) {
  return {
    version: 1,
    type: "categories/delete",
    payload: id,
  };
}

export function CategoriesUpdateAction(values) {
  return {
    version: 1,
    type: "categories/update",
    payload: values,
  };
}
