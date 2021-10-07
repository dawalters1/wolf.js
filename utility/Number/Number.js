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
    // convert persian digits [۰۱۲۳۴۵۶۷۸۹]
    let e = '۰'.charCodeAt(0);
    arg = arg.replace(/[۰-۹]/g, function (t) {
      return t.charCodeAt(0) - e;
    });

    // convert arabic indic digits [٠١٢٣٤٥٦٧٨٩]
    e = '٠'.charCodeAt(0);
    arg = arg.replace(/[٠-٩]/g, function (t) {
      return t.charCodeAt(0) - e;
    });
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
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return arg.replace(/[0-9]/g, function (w) {
      return arabicNumbers[+w];
    });
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
