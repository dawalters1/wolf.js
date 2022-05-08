const WOLFAPIError = require('../models/WOLFAPIError');
const validator = require('../validator');

const callbacks = {
  GROUP: 'group',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validation = (command) => {
  if (!(command instanceof require('./Command'))) {
    throw new WOLFAPIError('object must be an instance of command', command);
  }

  const { phraseName, callbackObject, children } = command;

  if (typeof (phraseName) !== 'string') {
    throw new WOLFAPIError('phraseName must be a string', phraseName);
  } else if (validator.isNullOrUndefined(phraseName)) {
    throw new WOLFAPIError('phraseName cannot be null or undefined', phraseName);
  } else if (validator.isNullOrWhitespace(phraseName)) {
    throw new WOLFAPIError('phraseName cannot be null or empty', phraseName);
  }

  if (validator.isNullOrUndefined(callbackObject)) {
    throw new WOLFAPIError('callbacks cannot be null or undefined', callbackObject);
  } else if (typeof callbackObject !== 'object') {
    throw new WOLFAPIError('callbacks must be an object', callbackObject);
  }

  Object.keys(callbackObject).forEach(callback => {
    if (!Object.values(callbacks).includes(callback)) {
      throw new WOLFAPIError('Invalid callback', callback);
    }
  });

  if (!validator.isValidArray(children)) {
    throw new WOLFAPIError('children must be an array', children);
  }

  return children.forEach(cmd => validation(cmd));
};

class Command {
  static get getCallback () {
    return callbacks;
  }

  constructor (phraseName, callbackObject, children = []) {
    this.phraseName = phraseName;
    this.callbackObject = callbackObject;
    this.children = (Array.isArray(children) ? children : [children]).filter(Boolean);

    validation(this);
  }
}

module.exports = Command;
