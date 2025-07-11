
process.on('unhandledRejection', (error) => console.error(error));

import Command from './src/commands/Command.js';
import CommandManager from './src/commands/CommandManager.js';
import WOLF from './src/client/WOLF.js';

const exports = {
  WOLF,
  Command,
  CommandManager
};

export {
  WOLF,
  Command,
  CommandManager,
  exports as default
};
