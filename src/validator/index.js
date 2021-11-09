const isNull = arg => arg === null;

const isNullOrWhitespace = arg => (arg === null || arg === undefined) || (typeof (arg) === 'string' && arg.trim().length === 0);

const isLessThanOrEqualZero = arg => isValidNumber(arg) && !(parseInt(arg) > 0);

const isLessThanZero = arg => isValidNumber(arg) && !(parseInt(arg) >= 0);

const isValidNumber = arg => /^-?\d+$/.test(arg);

const isValidArray = arg => Array.isArray(arg);

const isValidBoolean = arg => typeof arg === 'boolean' || (typeof arg === 'number' && (arg === 1 || arg === 0));

const isValidDate = arg => !isNaN(new Date(arg).getDate());

const isBuffer = arg => Buffer.isBuffer(arg);

module.exports = {
  isNull,
  isLessThanOrEqualZero,
  isNullOrWhitespace,
  isValidNumber,
  isValidArray,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isBuffer
};
