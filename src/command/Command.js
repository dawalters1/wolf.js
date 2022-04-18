
const validation = (command) => {
  const { phraseName, callbackObject, children } = command;

  // TODO:

  children.forEach(child => validation(child));
};

class Command {
  constructor (phraseName, callbackObject, children = []) {
    this.phraseName = phraseName;
    this.callbackObject = callbackObject;
    this.children = (Array.isArray(children) ? children : [children]).filter(Boolean);

    validation(this);
  }
}

module.exports = Command;
