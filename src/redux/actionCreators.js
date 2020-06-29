export function TransactionsCreateAction(values) {
  return {
    version: 1,
    type: "transactions/create",
    payload: values,
  };
}

export function TransactionsDeleteAction({ id, modifiedAt }) {
  return {
    version: 1,
    type: "transactions/delete",
    payload: { id, modifiedAt },
  };
}

export function TransactionsUpdateAction(values) {
  return {
    version: 1,
    type: "transactions/update",
    payload: values,
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

export function CategoriesUpdateAction({ from, to }) {
  return {
    version: 1,
    type: "categories/update",
    payload: { from, to },
  };
}

export function InitialSavingsUpdateAction(value) {
  return {
    version: 1,
    type: "initialSavings/update",
    payload: value,
  };
}
