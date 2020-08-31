import { useState, useEffect } from "react";

// useCoreAppData is similar to useState, but:
// - allows specifying a dataLoadFunc to load the field's value
// - re-runs the dataLoadFunc on coreApp.CHANGE_EVENT
//   (set `runOnce: true` to skip this behavior)
export default function useCoreAppData({
  coreApp,
  initialValue,
  runOnce,
  dataLoadFunc,
}) {
  const [value, setValue] = useState(null);

  // reset value to null on coreApp.CHANGE_EVENT
  useEffect(() => {
    function resetData() {
      setValue(null);
    }
    if (!runOnce) {
      coreApp.on(coreApp.CHANGE_EVENT, resetData);
      return () => coreApp.off(coreApp.CHANGE_EVENT, resetData);
    }
    return () => {};
  }, [coreApp]);

  // run dataLoadFunc when value is null
  useEffect(() => {
    if (value !== null) {
      return;
    }
    setValue(initialValue); // prevents running dataLoadFunc multiple times
    dataLoadFunc(setValue);
  }, [value, dataLoadFunc, initialValue]);

  return value === null ? initialValue : value;
}
