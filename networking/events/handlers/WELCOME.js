const BaseEvent = require('../BaseEvent');

const crypto = require('crypto');

const internal = require('../../../constants/internal');
const request = require('../../../constants/request');

const { deviceType, loginType } = require('@dawalters1/constants');

const toDeviceTypeId = (dev) => Object.entries(deviceType).find((device) => device[0].toLowerCase() === dev.toLowerCase())[1];

/**
 * {@hideconstructor}
 */
module.exports = class Welcome extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, data);

    if (!data.loggedInUser) {
      const login = async (api) => {
        const loginSettings = api.config._loginSettings;

        const result = await this._websocket.emit(request.SECURITY_LOGIN, {
          headers: {
            version: 2
          },
          body: {
            type: loginSettings.loginType,
            deviceTypeId: toDeviceTypeId(loginSettings.loginDevice),
            onlineState: loginSettings.onlineState,
            username: loginSettings.email,
            password: loginSettings.loginType === loginType.EMAIL ? crypto.createHash('md5').update(loginSettings.password).digest('hex') : loginSettings.password,
            md5Password: loginSettings.loginType === loginType.EMAIL
          }
        });
        if (!result.success) {
          api.on._emit(internal.LOGIN_FAILED, result);

          if (result.headers && result.headers.subCode && result.headers.subCode > 1) {
            await api.utility().delay(90000);// Attempt to reconnect after 90 seconds regardless of expiry given (Typically too many requests were sent and bot was barred)
            await login(api);
          }

          return;
        }

        api.cognito = result.body.cognito;
        api.currentSubscriber = result.body.subscriber;
        api.currentSubscriber.token = api.config._loginSettings.token;
        api.endpointConfig = data.endpointConfig;

        api.on._emit(internal.LOGIN_SUCCESS, result.body.subscriber);

        this.onSuccess(false);
      };

      return await login(this._api);
    } else {
      this._api.currentSubscriber = data.loggedInUser;

      this.onSuccess(true);
    }
  }

  async onSuccess (reconnect = false) {
    await Promise.all([
      this._api.group()._getJoinedGroups(),
      this._api.messaging()._messageGroupSubscribe(),
      this._api.messaging()._messagePrivateSubscribe(),
      this._api.tip()._groupSubscribe()
    ]);

    this._api.currentSubscriber = await this._api.subscriber().getById(this._api.currentSubscriber.id);

    this._api.on._emit(reconnect ? internal.RECONNECTED : internal.READY);
  }
};
