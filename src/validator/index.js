class Validator {
  constructor (value) {
    this.value = value;
  }

  isNotNullOrUndefined (message = 'Value is null or undefined') {
    if (this.value === null || this.value === undefined) {
      throw new Error(message);
    }
    return this;
  }

  isValidNumber (message = 'Value is not a valid number') {
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new Error(message);
    }
    return this;
  }

  isGreaterThanZero (message = 'Value must be greater than zero') {
    if (typeof this.value !== 'number' || this.value <= 0) {
      throw new Error(message);
    }
    return this;
  }

  isString (message = 'Value is not a string') {
    if (typeof this.value !== 'string') {
      throw new Error(message);
    }
    return this;
  }

  isBoolean (message = 'Value is not a boolean') {
    if (this.value instanceof Boolean) {
      throw new Error(message);
    }

    return this;
  }

  isNotEmptyOrWhitespace (message = 'String is empty or whitespace') {
    if (typeof this.value !== 'string' || this.value.trim() === '') {
      throw new Error(message);
    }
    return this;
  }

  isValidDate (message = 'Value is not a valid date') {
    const date = new Date(this.value);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(message);
    }
    return this;
  }

  isFuture (message = 'Date is not in the future') {
    const date = new Date(this.value);
    if (!(date instanceof Date) || isNaN(date.getTime()) || date <= new Date()) {
      throw new Error(message);
    }
    return this;
  }

  isPast (message = 'Date is not in the past') {
    const date = new Date(this.value);
    if (!(date instanceof Date) || isNaN(date.getTime()) || date >= new Date()) {
      throw new Error(message);
    }
    return this;
  }

  isBefore (otherDate, message = 'Date is not before the comparison date') {
    const current = new Date(this.value);
    const compare = new Date(otherDate);

    if (
      !(current instanceof Date) || isNaN(current.getTime()) ||
    !(compare instanceof Date) || isNaN(compare.getTime()) ||
    current >= compare
    ) {
      throw new Error(message);
    }

    return this;
  }

  isBuffer (message = 'Value is not a buffer') {
    if (this.value instanceof Buffer) {
      throw new Error(message);
    }

    return this;
  }

  isValidConstant (constants, message = 'Value is not valid') {
    if (!Object.values(constants).includes(this.value)) {
      throw new Error(message);
    }

    return this;
  }

  isValidArray (message = 'Value is not a valid array') {
    if (!Array.isArray(this.value)) {
      throw new Error(message);
    }

    return this;
  }

  containsNoDuplicates (message = 'Array cannot contain duplicates') {
    if (!Array.isArray(this.value)) {
      throw new Error('containsNoDuplicates() can only be used on arrays');
    }

    if ([...new Set(this.value)].length !== this.value.length) {
      throw new Error(message);
    }

    return this;
  }

  each () {
    if (!Array.isArray(this.value)) {
      throw new Error('each() can only be used on arrays');
    }

    const parent = this;
    return {
      isNotNullOrUndefined (message) {
        parent.value.forEach((item, index) => {
          try {
            validate(item).isNotNullOrUndefined(message);
          } catch (e) {
            throw new Error(message.replace('{index}', index).replace('{value}', item));
          }
        });
        return this;
      },

      isValidNumber (message) {
        parent.value.forEach((item, index) => {
          console.log(item);
          try {
            validate(item).isValidNumber(message);
          } catch (e) {
            throw new Error(message.replace('{index}', index).replace('{value}', item));
          }
        });
        return this;
      },

      isGreaterThanZero (message) {
        parent.value.forEach((item, index) => {
          try {
            validate(item).isGreaterThanZero(message);
          } catch (e) {
            throw new Error(message.replace('{index}', index).replace('{value}', item));
          }
        });
        return this;
      },

      isString (message) {
        parent.value.forEach((item, index) => {
          try {
            validate(item).isString(message);
          } catch (e) {
            throw new Error(message.replace('{index}', index).replace('{value}', item));
          }
        });
        return this;
      }

      // TODO: add more if I need too, cba to figure out what I need right now
    };
  }

  isValidOpts (matchable, message) {
    return this; // TODO:
  }
}

export function validate (value) {
  return new Validator(value);
}
