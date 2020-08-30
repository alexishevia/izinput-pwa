import { useState } from "react";

export default function useErrors() {
  const [errors, setErrors] = useState([]);

  function addError(err) {
    console.error(err);
    setErrors([...errors, err]);
  }

  function dismissErrors() {
    setErrors([]);
  }

  return [errors, addError, dismissErrors];
}
