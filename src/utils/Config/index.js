const { RetryMode } = require('../../constants');
const validator = require('../../validator');

const validateUserConfig = (api, opts) => {
  const _opts = Object.assign({}, opts);

  _opts.keyword = validator.isNullOrWhitespace(_opts.keyword) ? 'default' : _opts.keyword;

  _opts.app = typeof (_opts.app) === 'object' ? _opts.app : {};

  _opts.app.developerId = typeof _opts.app.developerId === 'number' ? parseInt(_opts.app.developerId) : undefined;

  _opts.app.defaultLanguage = validator.isNullOrWhitespace(_opts.app.defaultLanguage) ? 'en' : _opts.app.defaultLanguage;

  _opts.app.commandSettings = typeof (_opts.app.commandSettings) === 'object' ? _opts.app.commandSettings : {};

  _opts.app.commandSettings.ignoreOfficialBots = validator.isValidBoolean(_opts.app.commandSettings.ignoreOfficialBots) ? Boolean(_opts.app.commandSettings.ignoreOfficialBots) : false;

  _opts.app.commandSettings.ignoreUnofficialBots = validator.isValidBoolean(_opts.app.commandSettings.ignoreUnofficialBots) ? Boolean(_opts.app.commandSettings.ignoreUnofficialBots) : false;

  _opts.app.networkSettings = typeof (_opts.app.networkSettings) === 'object' ? _opts.app.networkSettings : {};

  _opts.app.networkSettings.retryMode = typeof _opts.app.networkSettings.retryMode === 'number' && Object.values(RetryMode).includes(parseInt(_opts.app.networkSettings.retryMode)) ? parseInt(_opts.app.networkSettings.retryMode) : RetryMode.ALWAYS_RETRY;
  _opts.app.networkSettings.retryAttempts = typeof _opts.app.networkSettings.retryAttempts === 'number' ? parseInt(_opts.app.networkSettings.retryAttempts) : 1;

  if (_opts.app.networkSettings.retryAttempts <= 0) {
    console.warn('[WARNING]: minimum retryAttempts is 1');
    _opts.app.networkSettings.retryAttempts = 1;
  } else if (_opts.app.networkSettings.retryAttempts >= 4) {
    console.warn('[WARNING]: maximum retryAttempts is 3');
    _opts.app.networkSettings.retryAttempts = 3;
  }

  api._options = {
    keyword: _opts.keyword,
    ignoreOfficialBots: _opts.app.commandSettings.ignoreOfficialBots,
    ignoreUnofficialBots: _opts.app.commandSettings.ignoreUnofficialBots,
    developerId: _opts.app.developerId,
    networking: {
      retryMode: _opts.app.networkSettings.retryMode,
      retryAttempts: _opts.app.networkSettings.retryAttempts
    }
  };

  api._config = _opts;
};

module.exports = {
  validateUserConfig
};
