class Number {
  toEnglishNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      arg = arg.toString().replace(/[٠-٩]/g, char => char.charCodeAt(0) - '٠'.charCodeAt(0));
      arg = arg.toString().replace(/[۰-۹]/g, char => char.charCodeAt(0) - '۰'.charCodeAt(0));

      return typeof arg === 'number' ? parseInt(arg) : arg;
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.number${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.toEnglishNumbers(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }

  toArabicNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.number${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.toArabicNumbers(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }

  toPersianNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.number${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.toPersianNumbers(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }

  addCommas (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      const args = arg.toString().split('.');

      return `${args[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${args[1] ? args[1] : ''}`;
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.number${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.addCommas(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }
}

module.exports = Number;
