import BaseUtility from './BaseUtility.js';
import { validate } from '../validation/Validation.js';

export default class NumberUtility extends BaseUtility {
  addCommas (arg) {
    validate(arg, this, this.addCommas)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    const [integerPart, decimalPart] = arg.toString().split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  }

  toEnglishNumbers (arg) {
    validate(arg, this, this.toEnglishNumbers)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    const fixedArg = arg.toString()
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660)) // Arabic
      .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06F0)); // Persian

    return isNaN(fixedArg)
      ? fixedArg
      : Number(fixedArg);
  }

  toArabicNumbers (arg) {
    validate(arg, this, this.toArabicNumbers)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
  }

  toPersianNumbers (arg) {
    validate(arg, this, this.toPersianNumbers)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
  }

  random (min, max) {
    const normalisedMin = this.normaliseNumber(min);
    const normalisedMax = this.normaliseNumber(max);

    validate(normalisedMin, this, this.random)
      .isNotNullOrUndefined()
      .isValidNumber();

    validate(normalisedMax, this, this.random)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero(normalisedMax);

    return Math.floor(Math.random() * max) + min;
  }
}
