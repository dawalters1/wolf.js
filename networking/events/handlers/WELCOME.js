const BaseEvent = require('../BaseEvent');

const crypto = require('crypto');

const internal = require('../../../constants/internal');
const request = require('../../../constants/request');

const { deviceType } = require('@dawalters1/constants');

const toDeviceTypeId = (dev) => {
  const devices = Object.entries(deviceType);

  return devices.find((device) => device[0].toLowerCase() === dev.toLowerCase())[1];
};

module.exports = class Welcome extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, data);

    if (!data.loggedInUser) {
      const login = async (bot) => {
        const loginSettings = bot.config._loginSettings;

        const result = await this._websocket.emit(request.SECURITY_LOGIN, {
          headers: {
            version: 2
          },
          body: {
            type: loginSettings.loginType,
            deviceTypeId: toDeviceTypeId(loginSettings.loginDevice),
            onlineState: loginSettings.onlineState,
            username: loginSettings.email,
            password: crypto.createHash('md5').update(loginSettings.password).digest('hex'),
            md5Password: true
          }
        });
        if (!result.success) {
          bot.on._emit(internal.LOGIN_FAILED, result);

          if (result.headers && result.headers.subCode && result.headers.subCode > 1) {
            await bot.utility().delay(90000);// Attempt to reconnect after 90 seconds regardless of expiry given (Typically too many requests were sent and bot was barred)
            await login(bot);
          }

          return;
        }

        bot.on._emit(internal.LOGIN_SUCCESS, result.body.subscriber);
        bot._cognito = result.body.cognito;
        bot.currentSubscriber = result.body.subscriber;
        bot._endpointConfig = data.endpointConfig;

        this.onSuccess(false);
      };

      return await login(this._bot);
    } else {
      this._bot.currentSubscriber = data.loggedInUser;

      this.onSuccess(true);
    }
  }

  async onSuccess (reconnect = false) {
    await Promise.all([
      this._bot.group()._getJoinedGroups(),
      this._bot.messaging()._messageGroupSubscribe(),
      this._bot.messaging()._messagePrivateSubscribe(),
      this._bot.tip()._groupSubscribe()
    ]);

    this._bot.currentSubscriber = await this._bot.subscriber().getById(this._bot.currentSubscriber.id);

    this._bot.on._emit(reconnect ? internal.RECONNECTED : internal.READY);
  }
};
