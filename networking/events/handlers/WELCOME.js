const BaseEvent = require('../BaseEvent');

const crypto = require('crypto');

const { deviceType } = require('@dawalters1/constants');

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
      const result = await this._websocket.emit(request.SECURITY_LOGIN,
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
    if(reconnect) {
	    this._bot._cognito = (await this._bot.websocket.emit('security token refresh')).body;     
		  this._bot._mediaService._creds = null;
    }

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
