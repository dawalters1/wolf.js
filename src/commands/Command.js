const callbacks = {
  CHANNEL: 'channel',
  PRIVATE: 'private',
  BOTH: 'both'
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
  }
}

export default Command;
