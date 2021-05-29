
module.exports = class BaseUtility {
  constructor (bot, utilityName) {
    this._bot = bot;
    this._utilityName = utilityName;
  }

  get utilityName () {
    return this._utilityName;
  }

  _func () { throw new Error(`${this._utilityName} Not implemented`); }
};
