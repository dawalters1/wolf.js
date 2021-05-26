const BaseEvent = require('../BaseEvent');

const crypto = require('crypto');

const constants = require('../../../constants');

const requests = {
  SECURITY_LOGIN: 'security login'
};

const toDeviceTypeId = (deviceType) => {
  const devices = Object.entries(constants.deviceType);

  return devices.find((device) => device[0].toLowerCase() === deviceType.toLowerCase())[1];
};

module.exports = class Welcome extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, data);

    if (!data.loggedInUser) {
      const result = await this._websocket.emit(requests.SECURITY_LOGIN,
        {
          headers:
                    {
                      version: 2
                    },
          body:
                    {
                      type: this._bot.config.app.loginSettings.loginType,
                      deviceTypeId: toDeviceTypeId(this._bot.config.app.loginSettings.loginDevice),
                      onlineState: this._bot.config.app.loginSettings.onlineState,
                      username: this._bot.config.app.loginSettings.email,
                      password: crypto.createHash('md5').update(this._bot.config.app.loginSettings.password).digest('hex'),
                      md5Password: true
                    }
        });

      if (!result.success) {
        this._bot.on._emit(this._internalEvents.LOGIN_FAILED, result);

        return;
      }

      this._bot.on._emit(this._internalEvents.LOGIN_SUCCESS, result.body.subscriber);
      this._bot._cognito = result.body.cognito;
      this._bot.currentSubscriber = result.body.subscriber;
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

    this._bot.on._emit(reconnect ? this._socketEvents.RECONNECTED : this._internalEvents.READY);
  }
};
