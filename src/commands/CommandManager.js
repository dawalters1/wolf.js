import _ from 'lodash';
import Command from './Command.js';
import CommandContext from '../entities/commandContext.js';
import UserPrivilege from '../constants/UserPrivilege.js';

class CommandManager {
  constructor (client) {
    this.client = client;
    this.commands = [];
    this.usePhrases = this.client.config.framework.commands.phrases;

    this.client.on('message', async (message) => {
      const ignoreSettings = this.client.config.framework.commands.ignore;

      if (!message.body) { return; }

      if (this.client.banned.isBanned(message.sourceUserId)) { return; }

      if (ignoreSettings.self && message.userId === this.client.me.id) { return; }

      const context = this._getCommand(
        this.commands,
        {
          isChannel: message.isChannel,
          body: message.body,
          targetChannelId: message.isChannel
            ? message.targetChannelId
            : undefined,
          sourceUserId: message.sourceUserId,
          timestamp: message.timestamp,
          type: message.mimeType,
          route: []
        }
      );

      if (!context.callback) { return; }

      if (ignoreSettings.official && (await this.client.user.getById(context.sourceUserId)).privilegeList.includes(UserPrivilege.BOT)) { return; }

      if (ignoreSettings.unofficial) {
        const unofficialCharmIds = client.config.charm.unofficial;
        const charmSummary = await this.client.charm.getUserSummary(context.userId);

        if (charmSummary.some((charm) => unofficialCharmIds.includes(charm.charmId))) { return; }
      }

      const callback = context.callback;
      Reflect.deleteProperty(context, 'callback');

      return callback.call(this, new CommandContext(this.client, context));
    });

    this.client.commandManager = this;
  }

  _getCommand (commands, context) {
    const argument = context.body.split(this.client.SPLIT_REGEX)[0];

    for (const command of commands) {
      const isChannel = context.isChannel && command.commandCallbackTypes.includes(Command.getCallback.CHANNEL);

      const isPrivate = !context.isChannel && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE);

      const isBoth = command.commandCallbackTypes.includes(Command.getCallback.BOTH);

      if (!(isChannel || isPrivate || isBoth)) { continue; }

      const matchable = this.usePhrases
        ? this.client.phrase.getAllByName(command.key)
        : [command.key];

      const matchedInput = matchable.find(match =>
        this.client.utility.string.isEqual(match?.value ?? match, argument)
      );

      if (!matchedInput) { continue; }

      context.body = context.body.slice((matchedInput?.value ?? matchedInput).length).trim();
      context.language = context.language ?? matchedInput.language ?? undefined;

      context.callback = isBoth
        ? command.callbackObject.both
        : isChannel
          ? command.callbackObject.channel
          : command.callbackObject.private;

      context.route.push(matchedInput instanceof Object
        ? _.omit(matchedInput, ['value'])
        : matchedInput);

      return (!command.children.length)
        ? context
        : this._getCommand(command.children, context);
    }

    return context;
  }

  async register (commands) {
    this.commands = commands;
  }

  isCommand (message) {
    const argument = message.body.split(this.client.SPLIT_REGEX)[0] ?? '';

    return this.commands.some(command => {
      const matchable = this.usePhrases
        ? this.client.phrase.getAllByName(command.key)
        : [command.key];

      const matchedInput = matchable.find(match =>
        this.client.utility.string.isEqual(match?.value ?? match, argument)
      );

      return Boolean(matchedInput);
    });
  }
}

export default CommandManager;
