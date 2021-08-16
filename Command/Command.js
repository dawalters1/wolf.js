const validator = require('@dawalters1/validator');

const callbacks = {
  GROUP: 'group',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validateCommand = command => {
  if (!(command instanceof require('./Command'))) {
    throw new Error('object must be an instance of command');
  }

  const trigger = command.trigger;

  if (typeof (trigger) !== 'string') {
    throw new Error('trigger must be a string');
  } else if (validator.isNullOrWhitespace(trigger)) {
    throw new Error('trigger cannot be null or empty');
  }

  const commandCallbacks = command.commandCallbacks;

  if (commandCallbacks === undefined || commandCallbacks === null) {
    throw new Error('callbacks cannot be null or undefined');
  } else if (typeof commandCallbacks !== 'object') {
    throw new Error('callbacks must be an object');
  }

  Object.keys(commandCallbacks).forEach(callback => {
    if (!Object.values(callbacks).includes(callback)) {
      throw new Error(`callbacks must be of the following: ${Object.values(callbacks).join(', ')}`);
    }
  });

  const children = command.children;

  if (children === undefined || children === null) {
    throw new Error('children cannot be null or undefined');
  } else if (!Array.isArray(children)) {
    throw new Error('children must be an array');
  }

  command.children.forEach(cmd => validateCommand(cmd));
};

module.exports = class Command {
  static get getCallback () {
    return callbacks;
  }

  constructor (trigger, commandCallbacks, children = []) {
    this.trigger = trigger;
    this.commandCallbacks = commandCallbacks;
    this.commandCallbackTypes = Object.keys(commandCallbacks);
    this.children = children;

    validateCommand(this);
  }
};
