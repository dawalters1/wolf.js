const isNull = (arg) => arg === null;
const isNullOrWhitespace = (arg) => typeof (arg) === 'string' && (arg === null || arg === undefined || arg.trim().length === 0);

const isLessThanOrEqualZero = (arg) => !(parseInt(arg) > 0);
const isLessThanZero = (arg) => !(parseInt(arg) >= 0);

const isValidNumber = (arg) => !Number.isNaN(arg);

const isValidArray = (arg) => Array.isArray(arg);

const isValidBoolean = (arg) => typeof arg === 'boolean';// Boolean(arg);

module.exports = {
  isNull,
  isLessThanOrEqualZero,
  isNullOrWhitespace,
  isValidNumber,
  isValidArray,
  isLessThanZero,
  isValidBoolean
};
