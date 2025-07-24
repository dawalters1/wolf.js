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

  isInstanceOf (instance, message = 'Value is not instance of') {
    return this.#throwIf(!(this.value instanceof instance), message);
  }

  isTypeOf (type, message = 'Value is not type of') {
    return this.#throwIf(!((String)(typeof this.value) !== type), message);
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

  isLessThan (value, message = 'Value must be less than {value}') {
    return this.#throwIf(typeof this.value !== 'number' || this.value >= value, message.replace('{value}', value));
  }

  isGreaterThan (value, message = 'Value must be less than {value}') {
    return this.#throwIf(typeof this.value !== 'number' || this.value <= value, message.replace('{value}', value));
  }

  isLessThanOrEqual (value, message = 'Value must be less than or equal to {value}') {
    return this.#throwIf(typeof this.value !== 'number' || this.value > value, message.replace('{value}', value));
  }

  isGreaterThanOrEqual (value, message = 'Value must be less than or equal to {value}') {
    return this.#throwIf(typeof this.value !== 'number' || this.value < value, message.replace('{value}', value));
  }

  // TODO: provide default value? isGreaterThan(num, mesage)
  isGreaterThanZero (message = 'Value must be greater than zero') {
    return this.#throwIf(typeof this.value !== 'number' || this.value <= 0, message);
  }

  isLessThanZero (message = 'Value must be greater than or equal to zero') {
    return this.#throwIf(typeof this.value !== 'number' || this.value < 0, message);
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

  isInList (keys, message = 'Value is not valid') {
    return this.#throwIf(!keys.includes(this.value), message);
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
      // TODO: add missing methods
      isInstanceOf (instance, message = 'Item is not instance of') {
        runEachValidation(item => validate(item).isInstanceOf(instance, message), message);
        return this;
      },
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

      isLessThanZero (message = 'Item at index {index} is not >= 0 ({value})') {
        runEachValidation(item => validate(item).isLessThanZero(message), message);
        return this;
      },

      isString (message = 'Item at index {index} is not a string ({value})') {
        runEachValidation(item => validate(item).isString(message), message);
        return this;
      },

      isValidObject (matchable, message = 'Value is not a valid object') {
        runEachValidation(item => validate(item).isValidObject(matchable, message));
        return this;
      }

      // Add more as needed...
    };
  }

  isValidObject (matchable, message = 'Value is not a valid object') {
    if (this.#shouldSkip()) { return this; }

    if (typeof this.value !== 'object' || this.value === null || Array.isArray(this.value)) {
      throw new Error(message);
    }

    const actual = this.value;

    const has = (obj, prop) =>
      obj && typeof obj === 'object' && !Array.isArray(obj) && Object.prototype.hasOwnProperty.call(obj, prop);

    const check = (actual, expected, path = '') => {
      for (const key in expected) {
        const fullPath = path
          ? `${path}.${key}`
          : key;
        const expectedValue = expected[key];
        const actualValue = actual[key];

        if (has(expectedValue, '__required_if')) {
          const { key: depKey, value: depValue } = expectedValue.__required_if;
          const dependencyValue = depKey.split('.').reduce((obj, part) => obj?.[part], actual);

          if (dependencyValue === depValue && !(key in actual)) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `is required because "${depKey}" is "${depValue}"`));
          }
        }

        if (has(expectedValue, '__not_required_if')) {
          const { key: depKey, value: depValue } = expectedValue.__not_required_if;
          const dependencyValue = depKey.split('.').reduce((obj, part) => obj?.[part], actual);

          if (dependencyValue === depValue && (key in actual)) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `is not allowed because "${depKey}" is "${depValue}"`));
          }
        }

        if (!(key in actual)) {
          continue;
        }

        if (has(expectedValue, '__enum')) {
          const enumValues = Object.values(expectedValue.__enum);
          if (!enumValues.includes(actualValue)) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `should be one of [${enumValues.join(', ')}], got "${actualValue}"`));
          }
          continue;
        }

        if (has(expectedValue, '__match_type') && expectedValue.__match_type === 'any') {
          const ctor = expectedValue.constructor;
          const isMatch =
          (ctor === String && typeof actualValue === 'string') ||
          (ctor === Number && typeof actualValue === 'number') ||
          (ctor === Boolean && typeof actualValue === 'boolean') ||
          (actualValue instanceof ctor);

          if (!isMatch) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `should be a ${ctor.name}, got ${typeof actualValue}`));
          }
          continue;
        }

        if (has(expectedValue, '__match_type') && expectedValue.__match_type === 'regex') {
          if (typeof actualValue !== 'string' || !expectedValue.regex.test(actualValue)) {
            throw new Error(`${message}: "${fullPath}" should match ${expectedValue.regex}, got "${actualValue}"`);
          }
          continue;
        }

        if (typeof expectedValue === 'object' && expectedValue !== null && 'type' in expectedValue) {
          const ctor = expectedValue.type;
          const isMatch =
          (ctor === String && typeof actualValue === 'string') ||
          (ctor === Number && typeof actualValue === 'number') ||
          (ctor === Boolean && typeof actualValue === 'boolean') ||
          (actualValue instanceof ctor);

          if (!isMatch) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `should be a ${ctor.name}, got ${typeof actualValue}`));
          }

          const nestedKeys = Object.keys(expectedValue).filter(k =>
            !['__required_if', '__enum', '__match_type', 'regex', 'type', '__not_required_if'].includes(k)
          );

          if (nestedKeys.length > 0) {
            const nestedSchema = Object.fromEntries(nestedKeys.map(k => [k, expectedValue[k]]));
            check(actualValue, nestedSchema, fullPath);
          }

          continue;
        }

        if (typeof expectedValue === 'function') {
          const ctor = expectedValue;
          const isMatch =
          (ctor === String && typeof actualValue === 'string') ||
          (ctor === Number && typeof actualValue === 'number') ||
          (ctor === Boolean && typeof actualValue === 'boolean') ||
          (actualValue instanceof ctor);

          if (!isMatch) {
            throw new Error(message
              .replace('{parameter}', key)
              .replace('{value}', key)
              .replace('{error}', `should be a ${ctor.name}, got ${typeof actualValue}`));
          }
          continue;
        }

        if (typeof expectedValue === 'object' && expectedValue !== null && !Array.isArray(expectedValue)) {
          check(actualValue, expectedValue, fullPath);
          continue;
        }

        if (actualValue !== expectedValue) {
          throw new Error(message
            .replace('{parameter}', key)
            .replace('{value}', key)
            .replace('{error}', `expected "${expectedValue}", got "${actualValue}"`));
        }
      }
    };

    check(actual, matchable);
    return this;
  }
}

export function validate (value) {
  return new Validator(value);
}
