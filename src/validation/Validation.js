import { fileTypeFromBuffer } from 'file-type';
import imageSize from 'image-size';
import { Readable } from 'node:stream';

class Validation {
  #name;
  #skipValidation = false;
  #value;
  constructor (value, _class, _method) {
    this.#name = _class instanceof String
      ? _class
      : _class && _method
        ? `${_class.constructor.name}.${_method.name}() `
        : '';
    this.#value = value; ;
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

  isNumberIn (allowed, message) {
    return this.#throwIf(
      typeof this.#value !== 'number' || !allowed.includes(this.#value),
      message ?? `${this.#name}${JSON.stringify(this.#value)} is not in ${JSON.stringify(allowed)}`
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

  isDateAfter (otherDate, message) {
    const current = new Date(this.#value);
    const compare = new Date(otherDate);

    return this.#throwIf(
      Number.isNaN(current.getTime()) ||
      Number.isNaN(compare.getTime()) ||
      current <= compare,
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
        isInstanceOf: (cls, message) => runValidation((item) => validateWithName(item, this.#name).isInstanceOf(cls, message)),
        isTypeOf: (type, message) => runValidation((item) => validateWithName(item, this.#name).isTypeOf(type, message)),
        isNotNull: (message) => runValidation((item) => validateWithName(item, this.#name).isNotNull(message)),
        isNotUndefined: (message) => runValidation((item) => validateWithName(item, this.#name).isNotUndefined(message)),
        isNotNullOrUndefined: (message) => runValidation((item) => validateWithName(item, this.#name).isNotNullOrUndefined(message)),
        isNotWhitespace: (message) => runValidation((item) => validateWithName(item, this.#name).isNotWhitespace(message)),
        isValidNumber: (message) => runValidation((item) => validateWithName(item, this.#name).isValidNumber(message)),
        isNumberIn: (allowed, message) => runValidation((item) => validateWithName(item, this.#name).isNumberIn(allowed, message)),
        isNumberLessThan: (min, message) => runValidation((item) => validateWithName(item, this.#name).isNumberLessThan(min, message)),
        isNumberLessThanZero: (message) => runValidation((item) => validateWithName(item, this.#name).isNumberLessThanZero(message)),
        isNumberGreaterThan: (max, message) => runValidation((item) => validateWithName(item, this.#name).isNumberGreaterThan(max, message)),
        isNumberGreaterThanZero: (message) => runValidation((item) => validateWithName(item, this.#name).isNumberGreaterThanZero(message)),
        isString: (message) => runValidation((item) => validateWithName(item, this.#name).isString(message)),
        isBoolean: (message) => runValidation((item) => validateWithName(item, this.#name).isBoolean(message)),
        isStream: (message) => runValidation((item) => validateWithName(item, this.#name).isStream(message)),
        isBuffer: (message) => runValidation((item) => validateWithName(item, this.#name).isBuffer(message)),
        isArray: (message) => runValidation((item) => validateWithName(item, this.#name).isArray(message)),
        isDate: (message) => runValidation((item) => validateWithName(item, this.#name).isDate(message)),
        isDateInFuture: (message) => runValidation((item) => validateWithName(item, this.#name).isDateInFuture(message)),
        isDateInPast: (message) => runValidation((item) => validateWithName(item, this.#name).isDateInPast(message)),
        isDateBefore: (other, message) => runValidation((item) => validateWithName(item, this.#name).isDateBefore(other, message)),
        in: (list, message) => runValidation((item) => validateWithName(item, this.#name).in(list, message)),
        duplicates: (message) => runValidation((item) => validateWithName(item, this.#name).duplicates(message)),
        each: () => runValidation((item) => validateWithName(item, this.#name).each())
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

      isNumberIn: (allowed, message) => runValidation(item => validateWithName(item, this.#name).isNumberIn(allowed, message)),
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
export async function validateConfig (value, config, profile, _class, _method) {
  const name = _class instanceof String
    ? _class
    : _class && _method
      ? `${_class.constructor.name}.${_method.name}() `
      : '';

  const { mime } = await fileTypeFromBuffer(value);

  if (!config.mimes.some((supportedMime) => supportedMime.type === mime)) {
    throw new Error(`${name}${mime} is an unsupported mimeType`);
  }

  if (mime.startsWith('image/')) {
    const mimeConfig = config.mimes.find((supportedMime) => supportedMime.type === mime);

    if ('minLevel' in mimeConfig && Math.floor(profile.reputation) < mimeConfig.minLevel) {
      throw new Error(`${config.route.includes('subscriber')
        ? 'Bot'
        : `Channel with ID ${profile.id}`} must be level ${mimeConfig.minLevel} or higher to upload a gif avatar`);
    }

    if (config.square) {
      const size = imageSize(value);

      if (size.width !== size.height) {
        throw new Error(`${name}Image must be square`);
      }
    }
  }

  const mimeConfig = config.mimes.find((supportedMime) => supportedMime.type === mime);

  const bufferSize = Buffer.byteLength(value);

  if (bufferSize > mimeConfig.size) {
    throw new Error(`${name}Image must be smaller than ${bufferSize} bytes`);
  }

  return true;
}
