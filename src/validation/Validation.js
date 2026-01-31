import { Readable } from 'node:stream';

class Validation {
  #value;
  #skipValidation = false;
  #name;
  constructor (value, _class, _method) {
    this.#value = value;
    this.#name = _class instanceof String
      ? _class
      : _class && _method
        ? `${_class.constructor.name}.${_method.name}() `
        : ''; ;
  }

  #shouldSkip () {
    return this.#skipValidation;
  }

  #throwIf (condition, message) {
    if (this.#shouldSkip()) { return this; }
    if (condition) { throw new Error(message); }
    return this;
  }

  isNotRequired () {
    this.#skipValidation = this.#value === undefined;

    return this;
  }

  requiredIfProperty (key, expectedValue, message) {
    if (this.#value[key] === expectedValue && (this.#value === undefined || this.#value === null)) {
      throw new Error(message ?? `${this.#name}${JSON.stringify(this.#value)} must contain property ${key}`);
    }
    return this;
  }

  notRequiredIfProperty (key, expectedValue) {
    if (this.#value[key] === expectedValue) { this.#skipValidation = true; }
    return this;
  }

  isInstanceOf (instance, message) {
    return this.#throwIf(
      !(this.#value instanceof instance),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not instance of ${instance.name}`
    );
  }

  isTypeOf (type, message) {
    return this.#throwIf(
      (String)(typeof this.#value) !== type,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not type ${type}`
    );
  }

  isNotNull (message) {
    return this.#throwIf(
      this.#value === null,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is null`
    );
  }

  isNotUndefined (message) {
    return this.#throwIf(
      this.#value === undefined,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is undefined`
    );
  }

  isNotNullOrUndefined (message) {
    return this.#throwIf(
      this.#value === null && this.#value === undefined,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is null or undefined`
    );
  }

  isNotWhitespace (message) {
    if (typeof this.#value !== 'string') { return this; }
    return this.#throwIf(this.#value?.trim() === '', message);
  }

  isValidNumber (message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || Number.isNaN(this.#value),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a valid number`
    );
  }

  isNumberLessThan (min, message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || this.#value >= min,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not less than ${min}`
    );
  }

  isNumberLessThanZero (message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || this.#value >= 0,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not less than 0`
    );
  }

  isNumberGreaterThan (max, message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || this.#value <= max,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not greater than ${max}`
    );
  }

  isNumberGreaterThanZero (message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || this.#value <= 0,
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not greater than 0`
    );
  }

  isString (message) {
    return this.#throwIf(
      typeof this.#value !== 'string',
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a string`
    );
  }

  isBoolean (message) {
    return this.#throwIf(
      typeof this.#value !== 'boolean',
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a boolean`
    );
  }

  isStream (message) {
    return this.#throwIf(
      !(this.#value instanceof Readable),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a stream`
    );
  }

  isBuffer (message) {
    return this.#throwIf(
      !Buffer.isBuffer(this.#value),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a buffer`
    );
  }

  isArray (message) {
    return this.#throwIf(
      !Array.isArray(this.#value),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not an array`
    );
  }

  isDate (message) {
    const date = new Date(this.#value);
    return this.#throwIf(
      Number.isNaN(date.getTime()),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a valid date`
    );
  }

  isDateInFuture (message) {
    const date = new Date(this.#value);
    return this.#throwIf(
      Number.isNaN(date.getTime()) || date <= new Date(),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a future date`
    );
  }

  isDateInPast (message) {
    const date = new Date(this.#value);
    return this.#throwIf(
      Number.isNaN(date.getTime()) || date >= new Date(),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not a past date`
    );
  }

  isDateBefore (otherDate, message) {
    const current = new Date(this.#value);
    const compare = new Date(otherDate);

    return this.#throwIf(
      Number.isNaN(current.getTime()) ||
      Number.isNaN(compare.getTime()) ||
      current >= compare,
      message ?? `${this.#name}${this.#value} is not before ${otherDate}`
    );
  }

  in (list, message) {
    return this.#throwIf(!list.includes(this.#value), message ?? `${this.#name}${this.#value} is not in list ${JSON.stringify(list)}`);
  }

  duplicates (message) {
    if (!Array.isArray(this.#value)) { throw new Error(`${this.#value} is not an array`); }

    return this.#throwIf([...new Set(this.#value)].length !== this.#value.length, message ?? `${this.#name}${JSON.stringify(this.#value)} contains duplicates`);
  }

  forEachProperty (propValidators) {
    if (this.#shouldSkip()) { return this; }
    if (typeof this.#value !== 'object' || this.#value === null) {
      throw new Error(`${this.#name}${JSON.stringify(this.#value)} is not an object`);
    }

    const self = this;

    const createPropValidator = (propName) => {
      const val = self.#value[propName];
      let skip = false;

      const runValidation = (fn) => {
        if (!skip) { fn(val); }
        return propValidator;
      };

      const propValidator = {
      // ---------------- conditional ----------------
        requiredIfProperty: (key, expected) => runValidation(() => {
          if (self.#value[key] === expected && (val === undefined || val === null)) {
            throw new Error(`${propName} is required because ${key} is ${expected}`);
          }
          return propValidator;
        }),
        notRequiredIfProperty: (key, expected) => {
          if (self.#value[key] === expected) { skip = true; }
          return propValidator;
        },

        // ---------------- standard validators ----------------
        isNotRequired: () => {
          if (val === undefined) { skip = true; }
          return propValidator;
        },
        isInstanceOf: (cls, message) => runValidation(v => validateWithName(v, this.#name).isInstanceOf(cls, message)),
        isTypeOf: (type, message) => runValidation(v => validateWithName(v, this.#name).isTypeOf(type, message)),
        isNotNull: (message) => runValidation(v => validateWithName(v, this.#name).isNotNull(message)),
        isNotUndefined: (message) => runValidation(v => validateWithName(v, this.#name).isNotUndefined(message)),
        isNotNullOrUndefined: (message) => runValidation(v => validateWithName(v, this.#name).isNotNullOrUndefined(message)),
        isNotWhitespace: (message) => runValidation(v => validateWithName(v, this.#name).isNotWhitespace(message)),
        isValidNumber: (message) => runValidation(v => validateWithName(v, this.#name).isValidNumber(message)),
        isNumberLessThan: (min, message) => runValidation(v => validateWithName(v, this.#name).isNumberLessThan(min, message)),
        isNumberLessThanZero: (message) => runValidation(v => validateWithName(v, this.#name).isNumberLessThanZero(message)),
        isNumberGreaterThan: (max, message) => runValidation(v => validateWithName(v, this.#name).isNumberGreaterThan(max, message)),
        isNumberGreaterThanZero: (message) => runValidation(v => validateWithName(v, this.#name).isNumberGreaterThanZero(message)),
        isString: (message) => runValidation(v => validateWithName(v, this.#name).isString(message)),
        isBoolean: (message) => runValidation(v => validateWithName(v, this.#name).isBoolean(message)),
        isStream: (message) => runValidation(v => validateWithName(v, this.#name).isStream(message)),
        isBuffer: (message) => runValidation(v => validateWithName(v, this.#name).isBuffer(message)),
        isArray: (message) => runValidation(v => validateWithName(v, this.#name).isArray(message)),
        isDate: (message) => runValidation(v => validateWithName(v, this.#name).isDate(message)),
        isDateInFuture: (message) => runValidation(v => validateWithName(v, this.#name).isDateInFuture(message)),
        isDateInPast: (message) => runValidation(v => validateWithName(v, this.#name).isDateInPast(message)),
        isDateBefore: (other, message) => runValidation(v => validateWithName(v, this.#name).isDateBefore(other, message)),
        in: (list, message) => runValidation(v => validateWithName(v, this.#name).in(list, message)),
        duplicates: (message) => runValidation(v => validateWithName(v, this.#name).duplicates(message)),
        each: () => runValidation(v => validateWithName(v, this.#name).each())
      };

      return propValidator;
    };

    for (const [prop, fn] of Object.entries(propValidators)) {
      fn(createPropValidator(prop));
    }

    return this; // allow chaining
  }

  each () {
    if (this.#shouldSkip()) { return this; }

    if (!Array.isArray(this.#value)) { throw new Error('each() can only be used on array'); }

    const runValidation = (func) => {
      this.#value.forEach((item) => func(item));
      return this.each();
    };

    return {
      isInstanceOf: (instance, message) => runValidation((item) => validate(item).isInstanceOf(instance, message)),
      isTypeOf: (type, message) => runValidation((item) => validate(item).isTypeOf(type, message)),
      isNotNull: (message) => runValidation((item) => validate(item).isNotNull(message)),
      isNotUndefined: (message) => runValidation((item) => validate(item).isNotUndefined(message)),
      isNotNullOrUndefined: (message) => runValidation((item) => validate(item).isNotNullOrUndefined(message)),
      isNotWhitespace: (message) => runValidation((item) => validate(item).isNotWhitespace(message)),
      isValidNumber: (message) => runValidation((item) => validate(item).isValidNumber(message)),
      isNumberLessThan: (min, message) => runValidation((item) => validate(item).isNumberLessThan(min, message)),
      isNumberLessThanZero: (message) => runValidation((item) => validate(item).isNumberLessThanZero(message)),
      isNumberGreaterThan: (max, message) => runValidation((item) => validate(item).isNumberGreaterThan(max, message)),
      isNumberGreaterThanZero: (message) => runValidation((item) => validate(item).isNumberGreaterThanZero(message)),
      isString: (message) => runValidation((item) => validate(item).isString(message)),
      isBoolean: (message) => runValidation((item) => validate(item).isBoolean(message)),
      isStream: (message) => runValidation((item) => validate(item).isStream(message)),
      isBuffer: (message) => runValidation((item) => validate(item).isBuffer(message)),
      isArray: (message) => runValidation((item) => validate(item).isArray(message)),
      isDate: (message) => runValidation((item) => validate(item).isDate(message)),
      isDateInFuture: (message) => runValidation((item) => validate(item).isDateInFuture(message)),
      isDateInPast: (message) => runValidation((item) => validate(item).isDateInPast(message)),
      isDateBefore: (otherDate, message) => runValidation((item) => validate(item).isDateBefore(otherDate, message)),
      in: (list, message) => runValidation((item) => validate(item).in(list, message)),
      duplicates: (message) => runValidation((item) => validate(item).duplicates(message)),
      forEachProperty: (propValidators) => {
        this.#value.forEach(item => {
          if (typeof item !== 'object' || item === null) {
            throw new Error(`${JSON.stringify(item)} is not an object`);
          }

          for (const [prop, fn] of Object.entries(propValidators)) {
            fn(validate(item[prop], this, prop));
          }
        });
        return this.each(); // keep chaining
      }

    };
  }
}
function validateWithName (value, name) {
  return new Validation(value, name);
}
export function validate (value, _class, _method) {
  return new Validation(value, _class, _method);
}
