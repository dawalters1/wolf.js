import { validate } from '../validator/index.js';

class NumberUtility {
  /**
   *
   * @param {string|number} arg - The string or number to update
   * @returns
   */
  addCommas (arg) {
    { // eslint-disable-line no-lone-blocks
      validate(arg)
        .isNotNullOrUndefined(`NumberUtility.addCommas() parameter, arg: ${arg} is null or undefined`)
        .isNotEmptyOrWhitespace(`NumberUtility.addCommas() parameter, arg: ${arg} is empty or whitespace`);
    }

    const [integerPart, decimalPart] = arg.toString().split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  }

  toEnglishNumbers (arg) {
    { // eslint-disable-line no-lone-blocks
      validate(arg)
        .isNotNullOrUndefined(`NumberUtility.toEnglishNumbers() parameter, arg: ${arg} is null or undefined`)
        .isNotEmptyOrWhitespace(`NumberUtility.toEnglishNumbers() parameter, arg: ${arg} is empty or whitespace`);
    }

    arg = arg.toString()
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660)) // Arabic
      .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06F0)); // Persian

    return isNaN(arg)
      ? arg
      : Number(arg);
  }

  toArabicNumbers (arg) {
    { // eslint-disable-line no-lone-blocks
      validate(arg)
        .isNotNullOrUndefined(`NumberUtility.toArabicNumbers() parameter, arg: ${arg} is null or undefined`)
        .isNotEmptyOrWhitespace(`NumberUtility.toArabicNumbers() parameter, arg: ${arg} is empty or whitespace`);
    }

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
  }

  toPersianNumbers (arg) {
    { // eslint-disable-line no-lone-blocks
      validate(arg)
        .isNotNullOrUndefined(`NumberUtility.toPersianNumbers() parameter, arg: ${arg} is null or undefined`)
        .isNotEmptyOrWhitespace(`NumberUtility.toPersianNumbers() parameter, arg: ${arg} is empty or whitespace`);
    }

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
  }
}

export default NumberUtility;
