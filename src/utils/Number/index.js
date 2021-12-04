class Number {
  constructor (api) {
    this._api = api;
  }

  toEnglishNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      arg = arg.toString().replace(this._api._botConfig.validation.numbers.persian.regex, char => char.charCodeAt(0) - '۰'.charCodeAt(0));
      arg = arg.toString().replace(this._api._botConfig.validation.numbers.arabic.regex, char => char.charCodeAt(0) - '٠'.charCodeAt(0));

      return arg;
    } catch (error) {
      error.internalErrorMessage = `api.utility().number().toEnglishNumbers(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }

  toArabicNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      return this.toEnglishNumbers(arg).toString().replace(this._api._botConfig.validation.numbers.english.regex, char => this._api._botConfig.validation.numbers.arabic.numbers[+char]);
    } catch (error) {
      error.internalErrorMessage = `api.utility().number().toArabicNumbers(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }

  toPersianNumbers (arg) {
    try {
      if (arg === undefined || arg === null) {
        throw new Error('arg cannot be undefined');
      }

      return this.toEnglishNumbers(arg).toString().replace(this._api._botConfig.validation.numbers.english.regex, char => this._api._botConfig.validation.numbers.persian.numbers[+char]);
    } catch (error) {
      error.internalErrorMessage = `api.utility().number().toPersianNumbers(arg=${JSON.stringify(arg)})`;
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
      error.internalErrorMessage = `api.utility().number().addCommas(arg=${JSON.stringify(arg)})`;
      throw error;
    }
  }
}

module.exports = Number;
