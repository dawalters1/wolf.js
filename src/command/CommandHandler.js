const CommandContext = require('../models/CommandContext');
const Command = require('./Command');

const CHARM_IDS = [813, 814];

const checkForPrivilege = async (api, subscriber, privileges) => {
  privileges = Array.isArray(privileges) ? privileges : [privileges];

  return privileges.some((privilege) => (subscriber.privileges & privilege) === privilege);
};

const checkForBotCharm = async (api, subscriber) => {
  if (subscriber.charms && subscriber.charms.selectedList.some((charm) => CHARM_IDS.includes(charm.charmId))) {
    return true;
  }

  if (subscriber.charmSummary) {
    return subscriber.charmSummary.some((charm) => CHARM_IDS.includes(charm.charmId));
  }

  subscriber.charmSummary = await api.charm.getSubscriberSummary(subscriber.id);

  return await checkForBotCharm(api, subscriber);
};

class CommandHandler {
  constructor (api) {
    this.api = api;
  }

  register (commands) {
    commands = Array.isArray(commands) ? commands : [commands];

    if (commands.length === 0) {
      throw new Error('commands cannot be empty');
    }

    this._commands = commands;
  }

  isCommand (message) {
    const args = message.split(this.api.SPLIT_REGEX).filter(Boolean);

    return this._commands.some((command) => this.api.phrase.getAllByName(command.phraseName).some((phrase) => this.api.utility.string.isEqual(phrase, args[0])));
  }

  async _onMessage (message) {
    const commandHandling = this.api.options.commandHandling;

    if (!message.body || await this.api.banned.isBanned(message.sourceSubscriberId) || (!commandHandling.processOwnMessages && message.sourceSubscriberId === this.api.currentSubscriber.id)) {
      return Promise.resolve();
    }

    const context = {
      isGroup: message.isGroup,
      argument: message.body,
      targetGroupId: message.targetGroupId,
      sourceSubscriberId: message.sourceSubscriberId,
      timestamp: message.timestamp,
      type: message.type
    };

    const command = this._getCommand(this._commands, context);

    if (!command.callback) {
      return Promise.resolve();
    }

    if (commandHandling.ignoreOfficialBots || commandHandling.ignoreUnofficialBots) {
      const subscriber = await this.api.subscriber.getById(context.sourceSubscriberId);

      if (commandHandling.ignoreOfficialBots && await checkForPrivilege(this.api, subscriber, Privilege.BOT)) {
        return Promise.resolve();
      }

      if (command.ignoreUnofficialBots && !await checkForPrivilege(this.api, subscriber, [Privilege.STAFF, Privilege.ENTERTAINER, Privilege.SELECTCLUB_1, Privilege.SELECTCLUB_2, Privilege.VOLUNTEER, Privilege.PEST, Privilege.GROUP_ADMIN, Privilege.ENTERTAINER, Privilege.RANK_1, Privilege.ELITECLUB_1, Privilege.ELITECLUB_2, Privilege.ELITECLUB_3, Privilege.BOT, Privilege.BOT_TESTER, Privilege.CONTENT_SUBMITER, Privilege.ALPHA_TESTER, Privilege.TRANSLATOR]) && await checkForBotCharm(this.api, subscriber)) {
        return Promise.resolve();
      }
    }

    const callback = command.callback;

    Reflect.deleteProperty(command, 'callback');

    return callback.call(this, new CommandContext(command));
  }

  _getCommand (commands, context) {
    const command = commands.find((command) => {
      const phrase = this.api.phrase.getAllByName(command.phraseName).find((phrase) => this.api.utility.string.isEqual(phrase, context.argument.split(this.api.SPLIT_REGEX)[0]));

      if (phrase && (command.commandCallbackTypes.includes(Command.getCallback.BOTH) || (context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE)))) {
        context.argument = context.argument.substr(phrase.value.length).trim();
        context.language = phrase.language;
        context.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !context.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;
        return command;
      }

      return false;
    });

    if (!command || command.children.length === 0) {
      return context;
    }

    return this._getCommand(command.children, context);
  }
}

module.exports = CommandHandler;
