const BaseUtility = require('../BaseUtility');

module.exports = class Number extends BaseUtility {
  constructor (bot) {
    super(bot, 'number');
  }

  _func () {
    return {
      toEnglishNumbers: (...args) => this.toEnglishNumbers(...args),
      toArabicNumbers: (...args) => this.toArabicNumbers(...args),
      addCommas: (...args) => this.addCommas(...args)
    };
  }

  toEnglishNumbers (arg) {
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

  toArabicNumbers (arg) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return arg.replace(/[0-9]/g, function (w) {
      return arabicNumbers[+w];
    });
  }

  addCommas (arg) {
    const args = arg.toString().split('.');

    return `${args[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${args[1] ? args[1] : ''}`;
  }
};
