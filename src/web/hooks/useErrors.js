import { useState } from "react";

export default function useErrors() {
  const [errors, setErrors] = useState([]);

  function addError(err) {
    setErrors([...errors, err]);
  }

  function dismissErrors() {
    setErrors([]);
  }

  return [errors, addError, dismissErrors];
}
