const BaseEvent = require('../BaseEvent');

const crypto = require('crypto');

const {
  deviceType
} = require('@dawalters1/constants');

const internal = require('../../../constants/internal');
const request = require('../../../constants/request');

const toDeviceTypeId = (dev) => {
  const devices = Object.entries(deviceType);

  return devices.find((device) => device[0].toLowerCase() === dev.toLowerCase())[1];
};

module.exports = class Welcome extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, data);

    if (!data.loggedInUser) {
      const loginSettings = this._bot.config._loginSettings;
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
        this._bot.on._emit(internal.LOGIN_FAILED, result);
        return;
      }

      this._bot.on._emit(internal.LOGIN_SUCCESS, result.body.subscriber);
      this._bot._cognito = result.body.cognito;
      this._bot.currentSubscriber = result.body.subscriber;
      this._bot._endpointConfig = data.endpointConfig;
    } else {
      this._bot.currentSubscriber = data.loggedInUser;
    }

    this.onSuccess(data.loggedInUser);
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
