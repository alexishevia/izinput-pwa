/* eslint no-restricted-syntax:[0] */

import { useState, useEffect } from "react";

export default function useAsyncState(initialValue, generator) {
  const [value, setValue] = useState(initialValue);

  // each generator is assigned a self-incrementing id
  // by keeping track of this id, we can cancel old generators
  let currentID = 0;

  function newGenerator() {
    currentID += 1;
    return [generator(), currentID];
  }

  function isCancelled(id) {
    return id < currentID;
  }

  function cancelPendingGenerators() {
    currentID += 1;
  }

  async function loadData() {
    const [gen, id] = newGenerator();
    for await (const val of gen) {
      if (isCancelled(id)) {
        return;
      }
      setValue(val);
    }
  }

  useEffect(() => {
    loadData();
    return () => {
      cancelPendingGenerators();
    };
  }, []);

  return [value, loadData];
}
