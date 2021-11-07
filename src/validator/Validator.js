
const isType = (arg, type) => {
  const typeOf = typeof arg;
  switch (type) {
    case 'string':
      return typeOf === 'string';
    case 'object':
      return typeOf === 'object';
    case 'bigint':
      return typeOf === 'bigint';
    case 'symbol':
      return typeOf === 'symbol';
    case 'number':
      return typeOf === 'number';
    case 'boolean':
      return typeOf === 'boolean';
    case 'undefined':
      return typeOf === undefined;
  }

  throw new Error('type is not a valid typeof');
};
const isNull = arg => arg === null;

const isNullOrUndefined = arg => arg === null || arg === undefined;

const isNullOrWhitespace = arg => isNullOrUndefined(arg) || (typeof (arg) === 'string' && arg.trim().length === 0);

const isLessThanOrEqualZero = arg => isValidNumber(arg) && !(parseInt(arg) > 0);

const isLessThanZero = arg => isValidNumber(arg) && !(parseInt(arg) >= 0);

const isValidNumber = arg => /^-?\d+$/.test(arg);

const isValidArray = arg => Array.isArray(arg);

const isValidBoolean = arg => typeof arg === 'boolean' || (typeof arg === 'number' && (arg === 1 || arg === 0));

const isValidDate = arg => !isNaN(new Date(arg).getDate());

const isBuffer = arg => Buffer.isBuffer(arg);

module.exports = {
  isNull,
  isNullOrUndefined,
  isLessThanOrEqualZero,
  isNullOrWhitespace,
  isValidNumber,
  isValidArray,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isBuffer,
  isType
};

module.exports = {

};
