const validator = require('../../validator');

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
      };

      route.push(value);

      return target;
    },
    config);
  } catch (error) {
    error.internalErrorMessage = `api.${configType}.get(path=${JSON.stringify(path)})`;
    throw error;
  }
};

const validateUserConfig = (api, opts) => {
  const _opts = Object.assign({}, opts);

  _opts.keyword = validator.isNullOrWhitespace(_opts.keyword) ? 'default' : _opts.keyword;

  _opts.app = typeof (_opts.app) === 'object' ? _opts.app : {};

  _opts.app.developerId = typeof _opts.app.developerId === 'number' && parseInt(_opts.app.developerId) > 0 ? parseInt(_opts.app.developerId) : undefined;

  _opts.app.defaultLanguage = validator.isNullOrWhitespace(_opts.app.defaultLanguage) ? 'en' : _opts.app.defaultLanguage;

  _opts.app.processOwnMessages = validator.isValidBoolean(_opts.app.processOwnMessages) ? Boolean(_opts.app.processOwnMessages) : false;

  _opts.app.commandSettings = typeof (_opts.app.commandSettings) === 'object' ? _opts.app.commandSettings : {};

  _opts.app.commandSettings.ignoreOfficialBots = validator.isValidBoolean(_opts.app.commandSettings.ignoreOfficialBots) ? Boolean(_opts.app.commandSettings.ignoreOfficialBots) : false;

  _opts.app.commandSettings.ignoreUnofficialBots = validator.isValidBoolean(_opts.app.commandSettings.ignoreUnofficialBots) ? Boolean(_opts.app.commandSettings.ignoreUnofficialBots) : false;

  api._options = {
    keyword: _opts.keyword,
    processOwnMessages: _opts.app.processOwnMessages,
    ignoreOfficialBots: _opts.app.commandSettings.ignoreOfficialBots,
    ignoreUnofficialBots: _opts.app.commandSettings.ignoreUnofficialBots,
    developerId: _opts.app.developerId
  };

  _opts.get = (args) => get('config', _opts, args);

  api._config = _opts;
};

const validateBotConfig = (api, opts) => {
  const _opts = Object.assign({}, opts);

  _opts.get = (args) => get('_botConfig', _opts, args);

  api._botConfig = _opts;
};

module.exports = {
  validateUserConfig,
  validateBotConfig
};
