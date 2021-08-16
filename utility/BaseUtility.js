
module.exports = class BaseUtility {
  constructor (api, utilityName) {
    this._api = api;
    this._utilityName = utilityName;
  }

  get utilityName () {
    return this._utilityName;
  }

  _func () { throw new Error(`${this._utilityName} Not implemented`); }
};
