import models from '../models/index.js';
import validator from '../validator/index.js';
const get = (configType, config, path) => {
  try {
    if (validator.isNullOrUndefined(path)) {
      throw new Error('path cannot be null or undefined');
    } else if (validator.isNullOrWhitespace(path)) {
      throw new Error('path cannot be null or whitespace');
    }
    if (path === 'get') {
      throw new Error('cannot get getter method');
    }
    const route = [];
    return path.split('.').filter(Boolean).map((route) => route.trim()).reduce((result, value) => {
      const target = result[value];
      if (target === undefined) {
        throw new Error(`${route.length === 0 ? 'config' : route.join('.')} does not contain property ${value}`);
      }
      ;
      route.push(value);
      return target;
    }, config);
  } catch (error) {
    error.internalErrorMessage = `client.${configType}.get(path=${JSON.stringify(path)})`;
    throw error;
  }
};
const validateUserConfig = (client, options) => {
  options = Object.assign({}, options);
  options.keyword = validator.isNullOrWhitespace(options.keyword) ? 'default' : options.keyword;
  options.app = typeof (options.app) === 'object' ? options.app : {};
  options.app.developerId = typeof options.app.developerId === 'number' && parseInt(options.app.developerId) > 0 ? parseInt(options.app.developerId) : undefined;
  options.app.defaultLanguage = validator.isNullOrWhitespace(options.app.defaultLanguage) ? 'en' : options.app.defaultLanguage;
  options.app.commandSettings = typeof (options.app.commandSettings) === 'object' ? options.app.commandSettings : {};
  options.app.commandSettings.ignoreOfficialBots = validator.isValidBoolean(options.app.commandSettings.ignoreOfficialBots) ? Boolean(options.app.commandSettings.ignoreOfficialBots) : false;
  options.app.commandSettings.ignoreUnofficialBots = validator.isValidBoolean(options.app.commandSettings.ignoreUnofficialBots) ? Boolean(options.app.commandSettings.ignoreUnofficialBots) : false;
  options.app.commandSettings.processOwnMessages = validator.isValidBoolean(options.app.commandSettings.processOwnMessages) ? Boolean(options.app.commandSettings.processOwnMessages) : false;
  options.app.messageSettings = typeof (options.app.messageSettings) === 'object' ? options.app.messageSettings : {};
  options.app.messageSettings.processOwnMessages = validator.isValidBoolean(options.app.messageSettings.processOwnMessages) ? Boolean(options.app.messageSettings.processOwnMessages) : false;
  options.app.messageSettings.subscriptions = typeof (options.app.messageSettings.subscriptions) === 'object' ? options.app.messageSettings.subscriptions : {};
  options.app.messageSettings.subscriptions.groupTipping = validator.isValidBoolean(options.app.messageSettings.subscriptions.groupTipping) ? Boolean(options.app.messageSettings.subscriptions.groupTipping) : true;
  options.app.messageSettings.subscriptions.groupMessages = validator.isValidBoolean(options.app.messageSettings.subscriptions.groupMessages) ? Boolean(options.app.messageSettings.subscriptions.groupMessages) : true;
  options.app.messageSettings.subscriptions.privateMessages = validator.isValidBoolean(options.app.messageSettings.subscriptions.privateMessages) ? Boolean(options.app.messageSettings.subscriptions.privateMessages) : true;
  if (options.app.commandSettings.processOwnMessages && !options.app.messageSettings.processOwnMessages) {
    throw new models.WOLFAPIError('messageSettings.processOwnMessages must be true in order for commandSettings.processOwnMessages to work', { options: options.app });
  }
  client.options = {
    keyword: options.keyword,
    commandHandling: {
      processOwnMessages: options.app.commandSettings.processOwnMessages
    },
    messageHandling: {
      processOwnMessages: options.app.messageSettings.processOwnMessages,
      subscriptions: options.app.messageSettings.subscriptions
    },
    ignoreOfficialBots: options.app.commandSettings.ignoreOfficialBots,
    ignoreUnofficialBots: options.app.commandSettings.ignoreUnofficialBots,
    developerId: options.app.developerId
  };
  options.get = (args) => get('config', options, args);
  client.config = options;
};
const validateBotConfig = (client, opts) => {
  const _opts = Object.assign({}, opts);
  _opts.get = (args) => get('_botConfig', _opts, args);
  client._botConfig = _opts;
};
export { validateUserConfig };
export { validateBotConfig };
export default {
  validateUserConfig,
  validateBotConfig
};
