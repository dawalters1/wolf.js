const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');
const { Commands } = require('../../constants');

class Store extends BaseHelper {
  constructor (api) {
    super(api);

    this._balance = -1;
  }

  async getBalance (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._balance >= 0) {
        return this._balance;
      }

      const result = await this._websocket.emit(Commands.STORE_CREDIT_BALANCE);

      if (result.success) {
        this._balance = result.body.balance;
      }

      return this._balance >= 0 ? this._balance : 0;
    } catch (error) {
      error.internalErrorMessage = `api.store().getBalance(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }
}

module.exports = Store;
