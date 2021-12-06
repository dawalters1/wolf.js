const SubscriberObject = require('../../../../models/SubscriberObject');

const crypto = require('crypto');
const { Events, Commands, DeviceType, LoginType } = require('../../../../constants');

const onSuccess = async (api, reconnect = false) => {
  await api._cleanup(false);

  await Promise.all([
    api.group()._joinedGroups(),
    api.messaging()._messageGroupSubscribe(),
    api.messaging()._messagePrivateSubscribe(),
    api.tip()._groupSubscribe()
  ]);

  api.currentSubscriber = await api.subscriber().getById(api.currentSubscriber.id);

  api.emit(reconnect ? Events.RECONNECTED : Events.READY);
};

const login = async (api) => {
  const loginSettings = api.config._loginSettings;

  const result = await api.websocket.emit(
    Commands.SECURITY_LOGIN,
    {
      headers: {
        version: 2
      },
      body: {
        type: loginSettings.LoginType,
        deviceTypeId: Object.entries(DeviceType).find((device) => device[0].toLowerCase() === loginSettings.loginDevice.toLowerCase())[1],
        onlineState: loginSettings.onlineState,
        username: loginSettings.email,
        password: loginSettings.LoginType === LoginType.EMAIL ? crypto.createHash('md5').update(loginSettings.password).digest('hex') : loginSettings.password,
        md5Password: loginSettings.LoginType === LoginType.EMAIL
      }
    }
  );

  if (!result.success) {
    api.emit(Events.LOGIN_FAILED, result);

    if (result.headers && result.headers.subCode && result.headers.subCode > 1) {
      await api.utility().delay(90000); // Attempt to reconnect after 90 seconds regardless of expiry given (Typically too many requests were sent and bot was barred)
      await login(api);
    }

    return;
  }

  api.cognito = result.body.cognito;
  api.currentSubscriber = result.body.subscriber;
  api.currentSubscriber
  api.token = api.config._loginSettings.token;

  api.emit(
    Events.LOGIN_SUCCESS,
    api.currentSubscriber,
    api.token
  );

  return await onSuccess(api, false);
};

module.exports = async (api, body) => {
  api.endpointConfig = body.endpointConfig;

  await api.emit(Events.WELCOME, body);

  if (!body.loggedInUser) {
    return await login(api);
  }

  api._currentSubscriber = new SubscriberObject(api, body.loggedInUser);

  return await onSuccess(api, true);
};
