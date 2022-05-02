const { Commands, Capability } = require('../../constants');
const Base = require('../Base');

const validator = require('../../validator');

const buildGroupFromModule = (groupModule) => {
  const base = groupModule.base;
  base.extended = groupModule.extended;
  base.audioConfig = groupModule.audioConfig;
  base.audioCounts = groupModule.audioCounts;
  base.messageConfig = groupModule.messageConfig;

  return base;
};

class Group extends Base {
  constructor (client) {
    super(client);

    this._fetched = false;
    this._groups = [];
  }
}

module.exports = Group;
