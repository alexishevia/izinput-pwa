import { isValidDayStr, isValidDateStr } from "./date";

function isDefined({ obj, field }) {
  return obj && Object.hasOwnProperty.call(obj, field);
}

function mustExist({ exists, failed }) {
  return exists || failed("is required");
}

function mustBeString({ exists, value, failed }) {
  if (exists && typeof value !== "string") {
    failed("must be a string");
  }
}

function mustNotBeEmptyString({ value, failed }) {
  return value.length || failed("cannot be empty");
}

function mustBeNumber({ exists, value, failed }) {
  if (!exists) return;
  if (typeof value !== "number" || Number.isNaN(value)) {
    failed("must be a number");
  }
}

function mustBeOneOf({ exists, value, failed, validOptions }) {
  if (exists && !validOptions.includes(value)) {
    failed("is not valid");
  }
}

function mustBeDayString({ exists, value, failed }) {
  if (exists && !isValidDayStr(value)) {
    failed("must match YYYY-MM-DD");
  }
}

function mustBeDateString({ exists, value, failed }) {
  if (exists && !isValidDateStr(value)) {
    failed("must be an ISO-8601 formatted string");
  }
}

export default class Validation {
  constructor(obj, field) {
    this.props = {
      obj,
      field,
      exists: isDefined({ obj, field }),
      value: obj[field],
      failed: msg => {
        throw new Error(`${field} ${msg}. Received: ${obj[field]}`);
      }
    };
  }

  required() {
    mustExist(this.props);
    return this;
  }

  string() {
    mustBeString(this.props);
    this.notEmpty = () => {
      mustNotBeEmptyString(this.props);
      return this;
    };
    return this;
  }

  number() {
    mustBeNumber(this.props);
    return this;
  }

  dayString() {
    mustBeDayString(this.props);
    return this;
  }

  dateString() {
    mustBeDateString(this.props);
    return this;
  }

  oneOf(validOptions) {
    mustBeOneOf({ ...this.props, validOptions });
    return this;
  }
}