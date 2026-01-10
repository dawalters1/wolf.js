import { validate } from '../validator/index.js';

const callbacks = {
  CHANNEL: 'channel',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validateCommand = (command) => {
  validate(command)
    .isInstanceOf(Command)
    .isValidObject(
      {
        key: String,
        callbackObject: Object,
        children: Array
      }
    );

  Object.keys(command.callbackObject).forEach(callback => {
    if (!Object.values(callbacks).includes(callback)) {
      throw new Error('Invalid callback', { callback });
    }
  });

  const childPhraseNameCountMap = command.children.map((child) => child.key)
    .reduce((previous, value) => {
      previous[value] = previous[value]
        ? previous[value] += 1
        : 1;

      return previous;
    }, {});

  if (Object.entries(childPhraseNameCountMap).some((result) => result[1] > 1)) {
    throw new Error('children commands must be unique and cannot share keys', { parent: command.key, children: Object.entries(childPhraseNameCountMap).filter((entry) => entry[1] > 1).map((entry) => entry[0]) });
  }

  return command.children.forEach((child) => validateCommand(child));
};

class Command {
  static get getCallback () {
    return callbacks;
  }

  constructor (key, callbackObject, children = []) {
    this.key = key;
    this.callbackObject = callbackObject;
    this.commandCallbackTypes = Object.keys(callbackObject);
    this.children = (Array.isArray(children)
      ? children
      : [children]).filter(Boolean);

    validateCommand(this);
  }
}

export default Command;
