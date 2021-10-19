const ARABIC = ['٠', '١', '٢', '٣', '٤', '٦', '٧', '٨', '٩'];
const PERSIAN = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
class Number {
  constructor (api) {
    this._api = api;
  }

  /**
   * Convert arabic or persian numbers to english
   * @param {Number|String} arg - The number or string to convert numbers
   * @returns {Number|String} - The argument with converted numbers
   */
  toEnglishNumbers (arg) {
    if (!arg) {
      throw new Error('arg cannot be undefined');
    }

    arg = arg.toString().replace(/[۰-۹]/g, char => char.charCodeAt(0) - '۰'.charCodeAt(0));
    arg = arg.toString().replace(/[٠-٩]/g, char => char.charCodeAt(0) - '٠'.charCodeAt(0));

    return arg;
  }

  /**
   * Convert english numbers to arabic
   * @param {Number | String} arg - The number or string to convert numbers
   * @returns {Number|String} - The argument with converted numbers
   */
  toArabicNumbers (arg) {
    if (!arg) {
      throw new Error('arg cannot be undefined');
    }

    return arg.toString().replace(/([0-9])/g, char => ARABIC[+char]);
  }

  /**
   * Convert english numbers to persian
   * @param {Number | String} arg - The number or string to convert numbers
   * @returns {Number|String} - The argument with converted numbers
   */
  toPersianNumbers (arg) {
    if (!arg) {
      throw new Error('arg cannot be undefined');
    }

    return arg.toString().replace(/([0-9])/g, char => PERSIAN[+char]);
  }

  /**
   * Add Commas to numbers
   * @param {Number | String} arg - The number or string to commas too
   * @returns {Number|String} - The argument with commas added
   */
  addCommas (arg) {
    if (!arg) {
      throw new Error('arg cannot be undefined');
    }
    const args = arg.toString().split('.');

    return `${args[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${args[1] ? args[1] : ''}`;
  }
}

module.exports = Number;
