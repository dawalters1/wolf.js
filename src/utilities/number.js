import BaseUtility from './BaseUtility.js';

export default class NumberUtility extends BaseUtility {
  addCommas (arg) {
    const [integerPart, decimalPart] = arg.toString().split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  }

  toEnglishNumbers (arg) {
    arg = arg.toString()
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660)) // Arabic
      .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06F0)); // Persian

    return isNaN(arg)
      ? arg
      : Number(arg);
  }

  toArabicNumbers (arg) {
    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
  }

  toPersianNumbers (arg) {
    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
  }

  random (min, max) {
    return Math.floor(Math.random() * max) + min;
  }
}
