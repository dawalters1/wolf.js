const _ = require('lodash');

class NumberUtility {
  toEnglishNumbers (arg) {
    arg = arg.toString().replace(/[٠-٩]/g, char => char.charCodeAt(0) - '٠'.charCodeAt(0));
    arg = arg.toString().replace(/[۰-۹]/g, char => char.charCodeAt(0) - '۰'.charCodeAt(0));

    return typeof arg === 'number' ? parseInt(arg) : arg;
  }

  toArabicNumbers (arg) {
    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
  }

  toPersianNumbers (arg) {
    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
  }

  addCommas (arg) {
    const args = arg.toString().split('.');

    return `${args[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${args[1] ? args[1] : ''}`;
  }

  random (min = 0, max = 1) {
    return _.random(min, max);
  }

  clamp (number, lower, upper) {
    return _.clamp(number, lower, upper);
  }
}

module.exports = NumberUtility;
