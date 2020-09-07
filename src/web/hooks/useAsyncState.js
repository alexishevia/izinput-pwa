/* eslint no-restricted-syntax:[0] */

import { useState, useEffect } from "react";

export default function useAsyncState(initialValue, generator) {
  const [value, setValue] = useState(initialValue);

  let isCancelled = false;

  async function loadData() {
    if (isCancelled) {
      return;
    }
    const it = generator();
    for await (const val of it) {
      if (isCancelled) {
        return;
      }
      setValue(val);
    }
  }

  useEffect(() => {
    loadData();
    return function onExit() {
      isCancelled = true; // cancels loadData once component is unmounted
    };
  }, []);

  return [value, loadData];
}
