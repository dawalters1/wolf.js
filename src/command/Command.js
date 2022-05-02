/* eslint-disable no-unused-vars */

const callbacks = {
  GROUP: 'group',
  PRIVATE: 'private',
  BOTH: 'both'
};

const validation = (command) => {
  const { phraseName, callbackObject, children } = command;

  // TODO:

  children.forEach(child => validation(child));
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
