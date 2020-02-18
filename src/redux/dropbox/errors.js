export function getErrorMessage(err) {
  if (err.message) return err.message;
  if (typeof err.error === "string") return err.error;
  if (typeof err.error_summary === "string") return err.error_summary;
  if (err.error && typeof err.error.error_summary === "string")
    return err.error.error_summary;
  return "Unkown error.";
}

export function isNewFile(err) {
  return getErrorMessage(err).includes("not_found");
}
