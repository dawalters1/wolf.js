import WOLFAPIError from '../models/WOLFAPIError.js';
import validator from '../validator/index.js';

const callbacks = {
  GROUP: 'group',
  CHANNEL: 'channel',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validation = async (command) => {
  if (!(command instanceof (await import('./Command.js')).default)) {
    throw new WOLFAPIError('object must be an instance of command', { command });
  }

  const { phraseName, callbackObject, children } = command;

  if (typeof (phraseName) !== 'string') {
    throw new WOLFAPIError('phraseName must be a string', { phraseName });
  } else if (validator.isNullOrUndefined(phraseName)) {
    throw new WOLFAPIError('phraseName cannot be null or undefined', { phraseName });
  } else if (validator.isNullOrWhitespace(phraseName)) {
    throw new WOLFAPIError('phraseName cannot be null or empty', { phraseName });
  }

  if (validator.isNullOrUndefined(callbackObject)) {
    throw new WOLFAPIError('callbacks cannot be null or undefined', { callbackObject });
  } else if (typeof callbackObject !== 'object') {
    throw new WOLFAPIError('callbacks must be an object', { callbackObject });
  }

  Object.keys(callbackObject).forEach(callback => {
    if (!Object.values(callbacks).includes(callback)) {
      throw new WOLFAPIError('Invalid callback', { callback });
    }
  });

  if (!Array.isArray(children)) {
    throw new WOLFAPIError('children must be an array', { children });
  }

  const childPhraseNameCountMap = children.map((child) => child.phraseName)
    .reduce((previous, value) => {
      previous[value] = previous[value] ? previous[value] += 1 : 1;

      return previous;
    }, {});

  if (Object.entries(childPhraseNameCountMap).some((result) => result[1] > 1)) {
    throw new WOLFAPIError('children commands must be unique and cannot share phrase names', { parent: command.phraseName, children: Object.entries(childPhraseNameCountMap).filter((entry) => entry[1] > 1).map((entry) => entry[0]) });
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
    this.commandCallbackTypes = Object.keys(callbackObject);
    this.children = (Array.isArray(children) ? children : [children]).filter(Boolean);

    validation(this);
  }
}

export default Command;
