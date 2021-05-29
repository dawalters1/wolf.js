const BaseUtility = require('../BaseUtility');

module.exports = class ToEnglishNumbers extends BaseUtility {
  constructor (bot) {
    super(bot, 'toEnglishNumbers');
  }

  _function (...args) {
    let arg = args[0];

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
};
