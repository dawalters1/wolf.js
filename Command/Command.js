/* eslint-disable */

const callbacks = {
  GROUP: 'group',
  PRIVATE: 'private',
  BOTH: 'both',
};

class Command {
  static get getCallback() {
    return callbacks;
  }

  constructor(trigger, commandCallbacks, children = []) {
    const checkCommand = command => {
      if (!(command instanceof Command)) {
        throw new Error('Is not a valid command');
      }

      if (command.trigger === undefined || typeof command.trigger !== 'string') {
        throw new Error(`Invalid command trigger`);
      }

      if (command.commandCallbacks === undefined || typeof command.commandCallbacks !== 'object') {
        throw new Error(`Invalid command callback`);
      }

        Object.keys(command.commandCallbacks).forEach(callback => {
            if (callback !== callbacks.GROUP && callback !== callbacks.BOTH && callbacks !== callbacks.PRIVATE) {
          throw new Error(`Contains an invalid command callback`);
        }
      });

      if (command.children === undefined || !Array.isArray(command.children)) {
        throw new Error('Children is invalid');
      }

      command.children.forEach(cmd => checkCommand(cmd));
    };

    if (trigger === undefined || typeof trigger !== 'string') {
      throw new Error(`Trigger ${trigger} is either undefined or not a string`);
    }

    if (commandCallbacks === undefined || typeof commandCallbacks !== 'object') {
      throw new Error(`Command ${trigger} contains an invalid callback`);
    }

    Object.keys(commandCallbacks).forEach(callback => {
      if (callback !== callbacks.GROUP && callback !== callbacks.BOTH && callbacks !== callbacks.PRIVATE) {
        throw new Error(`Command ${trigger} contains an invalid callback`);
      }
    });

    if (children === undefined || !Array.isArray(children)) {
      throw new Error('Children is invalid');
    }

    children.forEach(command => checkCommand(command));

    this.trigger = trigger;

    this.commandCallbacks = commandCallbacks;

    this.commandCallbackTypes = Object.keys(commandCallbacks);

    this.children = children;
  }
};

module.exports = Command;