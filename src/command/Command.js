const validator = require('../validator');

const callbacks = {
  GROUP: 'group',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validateCommand = command => {
  if (!(command instanceof require('./Command'))) {
    throw new Error('object must be an instance of command');
  }

  const phraseName = command.phraseName;

  if (typeof (phraseName) !== 'string') {
    throw new Error('phraseName must be a string');
  } else if (validator.isNullOrUndefined(phraseName)) {
    throw new Error('phraseName cannot be null or undefined');
  } else if (validator.isNullOrWhitespace(phraseName)) {
    throw new Error('phraseName cannot be null or empty');
  }

  const commandCallbacks = command.commandCallbacks;

  if (validator.isNullOrUndefined(commandCallbacks)) {
    throw new Error('callbacks cannot be null or undefined');
  } else if (typeof commandCallbacks !== 'object') {
    throw new Error('callbacks must be an object');
  }

  Object.keys(commandCallbacks).forEach(callback => {
    if (!Object.values(callbacks).includes(callback)) {
      throw new Error(`callbacks must be of the following: ${Object.values(callbacks).join(', ')}`);
    }
  });

  if (!validator.isValidArray(command.children)) {
    throw new Error('children must be an array');
  }

  command.children.forEach(cmd => validateCommand(cmd));
};

module.exports = class Command {
  static get getCallback () {
    return callbacks;
  }

  constructor (phraseName, commandCallbacks, children = []) {
    this.phraseName = phraseName;
    this.commandCallbacks = commandCallbacks;
    this.commandCallbackTypes = Object.keys(commandCallbacks);
    this.children = children || [];

    validateCommand(this);
  }
};
