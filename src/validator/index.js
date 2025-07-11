import Stream from 'node:stream';

class Validator {
  constructor (value) {
    this.value = value;
    this.forceValidation = false;
  }

  isNotRequired () {
    if (this.value === undefined) {
      this.forceValidation = true;
    }
    return this;
  }

  #shouldSkip () {
    return this.forceValidation;
  }

  #throwIf (condition, message) {
    if (this.#shouldSkip()) { return this; }
    if (condition) { throw new Error(message); }
    return this;
  }

  isNotNullOrUndefined (message = 'Value is null or undefined') {
    return this.#throwIf(this.value === null || this.value === undefined, message);
  }

  isNotNull (message = 'Value is null') {
    return this.#throwIf(this.value === null, message);
  }

  isValidNumber (message = 'Value is not a valid number') {
    return this.#throwIf(typeof this.value !== 'number' || isNaN(this.value), message);
  }

  isGreaterThanZero (message = 'Value must be greater than zero') {
    return this.#throwIf(typeof this.value !== 'number' || this.value <= 0, message);
  }

  isString (message = 'Value is not a string') {
    return this.#throwIf(typeof this.value !== 'string', message);
  }

  isBoolean (message = 'Value is not a boolean') {
    return this.#throwIf(typeof this.value !== 'boolean', message);
  }

  isStream (message = 'Value is not a stream') {
    return this.#throwIf(!(this.value instanceof Stream), message);
  }

  isNotEmptyOrWhitespace (message = 'String is empty or whitespace') {
    return this.#throwIf(typeof this.value !== 'string' || this.value.trim() === '', message);
  }

  isValidDate (message = 'Value is not a valid date') {
    const date = new Date(this.value);
    return this.#throwIf(!(date instanceof Date) || isNaN(date.getTime()), message);
  }

  isFuture (message = 'Date is not in the future') {
    const date = new Date(this.value);
    return this.#throwIf(!(date instanceof Date) || isNaN(date.getTime()) || date <= new Date(), message);
  }

  isPast (message = 'Date is not in the past') {
    const date = new Date(this.value);
    return this.#throwIf(!(date instanceof Date) || isNaN(date.getTime()) || date >= new Date(), message);
  }

  isBefore (otherDate, message = 'Date is not before the comparison date') {
    const current = new Date(this.value);
    const compare = new Date(otherDate);
    return this.#throwIf(
      !(current instanceof Date) || isNaN(current.getTime()) ||
      !(compare instanceof Date) || isNaN(compare.getTime()) ||
      current >= compare,
      message
    );
  }

  isBuffer (message = 'Value is not a buffer') {
    return this.#throwIf(!(this.value instanceof Buffer), message);
  }

  isValidConstant (constants, message = 'Value is not valid') {
    return this.#throwIf(!Object.values(constants).includes(this.value), message);
  }

  isValidArray (message = 'Value is not a valid array') {
    return this.#throwIf(!Array.isArray(this.value), message);
  }

  containsNoDuplicates (message = 'Array cannot contain duplicates') {
    this.isValidArray('containsNoDuplicates() can only be used on arrays');
    return this.#throwIf([...new Set(this.value)].length !== this.value.length, message);
  }

  each () {
    if (this.#shouldSkip()) { return this; }

    if (!Array.isArray(this.value)) {
      throw new Error('each() can only be used on arrays');
    }

    const parentArray = this.value;

    function runEachValidation (fn, message) {
      parentArray.forEach((item, index) => {
        try {
          fn(item);
        } catch {
          throw new Error(
            message.replace('{index}', index).replace('{value}', item)
          );
        }
      });
    }

    return {
      isNotNullOrUndefined (message = 'Item at index {index} is null or undefined ({value})') {
        runEachValidation(item => validate(item).isNotNullOrUndefined(message), message);
        return this;
      },

      isValidNumber (message = 'Item at index {index} is not a valid number ({value})') {
        runEachValidation(item => validate(item).isValidNumber(message), message);
        return this;
      },

      isGreaterThanZero (message = 'Item at index {index} is not > 0 ({value})') {
        runEachValidation(item => validate(item).isGreaterThanZero(message), message);
        return this;
      },

      isString (message = 'Item at index {index} is not a string ({value})') {
        runEachValidation(item => validate(item).isString(message), message);
        return this;
      }

      // Add more as needed...
    };
  }

  isValidObject (matchable, message = 'Value is not a valid object') {
    // TODO: Implement object shape checking if needed
    return this;
  }
}

export function validate (value) {
  return new Validator(value);
}
