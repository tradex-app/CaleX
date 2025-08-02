// Type checking utilities

export function isBoolean(b) {
  return typeof b === "boolean";
}

export function isNumber(n) {
  return typeof n === "number" && isFinite(n);
}

export function isInteger(n) {
  return isNumber(n) && n % 1 === 0;
}

export function isString(s) {
  return typeof s === "string";
}

export function isStringOrNumber(o) {
  return isString(o) || isNumber(o);
}

export function isFunction(f) {
  return typeof f === "function";
}

export function isObject(o) {
  return o !== null && typeof o === "object" && !(o instanceof Array);
}

export function isArray(a) {
  return Array.isArray(a);
}

export function isArrayOfType(arr, type) {
  if (!isArray(arr)) return false;
  return arr.every(item => {
    switch(type) {
      case "string": return isString(item);
      case "number": return isNumber(item);
      case "boolean": return isBoolean(item);
      case "function": return isFunction(item);
      case "object": return isObject(item);
      default: return false;
    }
  });
}

export function isPromise(p) {
  return p && typeof p.then === "function";
}

export function isDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function isValidDateString(s) {
  if (!isString(s)) return false;
  const date = new Date(s);
  return isDate(date);
}

export function isTimestamp(t) {
  return isNumber(t) && t > 0 && t <= Date.now() * 2; // Allow future dates up to 2x current time
}

export function isValidId(id) {
  return isString(id) || isNumber(id);
}

export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

export function isNonEmptyString(s) {
  return isString(s) && s.trim().length > 0;
}

export function isNonEmptyArray(a) {
  return isArray(a) && a.length > 0;
}

export function hasProperties(obj, properties) {
  if (!isObject(obj)) return false;
  if (!isArray(properties)) return false;
  return properties.every(prop => obj.hasOwnProperty(prop));
}

// Validation helpers
export function validateDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return isDate(startDate) && isDate(endDate) && startDate <= endDate;
}

export function validateEventData(eventData) {
  return isObject(eventData) && 
         hasProperties(eventData, ['id', 'date']) &&
         isValidId(eventData.id) &&
         (isDate(eventData.date) || isValidDateString(eventData.date) || isTimestamp(eventData.date));
}

export function validateOptions(options, requiredProps = [], optionalProps = []) {
  if (!isObject(options)) return false;
  
  // Check required properties
  const hasRequired = requiredProps.every(prop => options.hasOwnProperty(prop));
  if (!hasRequired) return false;
  
  // Check that all properties are either required or optional
  const allProps = [...requiredProps, ...optionalProps];
  const hasUnknownProps = Object.keys(options).some(prop => !allProps.includes(prop));
  
  return !hasUnknownProps;
}
