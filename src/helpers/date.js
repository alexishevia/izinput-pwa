const dayStrRegex = /^\d{4}-\d{2}-\d{2}$/;

// from a Date object to a day string 'YYYY-MM-DD'
export function dateToDayStr(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// from a day string 'YYYY-MM-DD' to a Date object
export function dayStrToDate(dateStr, endOfDay) {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

export function isValidDayStr(str) {
  return str && str.match && str.match(dayStrRegex);
}

export function isValidDate(date) {
  return date && date.getTime && !Number.isNaN(date.getTime());
}

export function isValidDateStr(str) {
  return str && typeof str === "string" && isValidDate(new Date(str));
}

export function isValidUTCDateStr(str) {
  return isValidDateStr(str) && new Date(str).toISOString() === str;
}

export function monthStart(date) {
  const now = date || new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function monthEnd(date) {
  const now = date || new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

export function getMonthStrFromDate(date) {
  return date.toISOString().slice(0, 7);
}

export function substractMonths(date, nMonths) {
  const result = new Date(date);
  result.setMonth(date.getMonth() - nMonths);
  return result;
}

export function addMonths(date, nMonths) {
  const result = new Date(date);
  result.setMonth(date.getMonth() + nMonths);
  return result;
}
