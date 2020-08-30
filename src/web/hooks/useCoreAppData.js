import { useState, useEffect } from "react";

// useCoreAppData is similar to useState, but:
// - returns an initialValue of `null`, until the dataLoadFunc runs
// - re-runs the dataLoadFunc on coreApp.CHANGE_EVENT
export default function useCoreAppData(coreApp, dataLoadFunc) {
  const [value, setValue] = useState(null);

  // reset value to null on coreApp.CHANGE_EVENT
  useEffect(() => {
    function resetData() {
      setValue(null);
    }
    coreApp.on(coreApp.CHANGE_EVENT, resetData);
    return () => coreApp.off(coreApp.CHANGE_EVENT, resetData);
  }, [coreApp]);

  // run dataLoadFunc when value is null
  useEffect(() => {
    if (value !== null) {
      return;
    }
    dataLoadFunc(setValue);
  }, [value, dataLoadFunc]);

  return value;
}
