const SubscriberObject = require('../../../../models/SubscriberObject');

const crypto = require('crypto');
const { internal, request } = require('../../../../constants');

const { deviceType, loginType } = require('@dawalters1/constants');

const onSuccess = async (api, reconnect = false) => {
  await Promise.all([
    api.group()._getJoinedGroups(),
    api.messaging()._messageGroupSubscribe(),
    api.messaging()._messagePrivateSubscribe(),
    api.tip()._groupSubscribe()
  ]);

  api.currentSubscriber = await api.subscriber().getById(api.currentSubscriber.id);

  api.emit(reconnect ? internal.RECONNECTED : internal.READY);
};

const login = async (api) => {
  const loginSettings = api.config._loginSettings;

  const result = await api.websocket.emit(request.SECURITY_LOGIN, {
    headers: {
      version: 2
    },
    body: {
      type: loginSettings.loginType,
      deviceTypeId: Object.entries(deviceType).find((device) => device[0].toLowerCase() === loginSettings.loginDevice.toLowerCase())[1],
      onlineState: loginSettings.onlineState,
      username: loginSettings.email,
      password: loginSettings.loginType === loginType.EMAIL ? crypto.createHash('md5').update(loginSettings.password).digest('hex') : loginSettings.password,
      md5Password: loginSettings.loginType === loginType.EMAIL
    }
  });

  if (!result.success) {
    api.emit(internal.LOGIN_FAILED, result);

    if (result.headers && result.headers.subCode && result.headers.subCode > 1) {
      await api.utility().delay(90000); // Attempt to reconnect after 90 seconds regardless of expiry given (Typically too many requests were sent and bot was barred)
      await login(api);
    }

    return;
  }

  api.cognito = result.body.cognito;
  api.currentSubscriber = result.body.subscriber;
  api.currentSubscriber.token = api.config._loginSettings.token;

  api.emit(
    internal.LOGIN_SUCCESS,
    api.currentSubscriber
  );

  return await onSuccess(api, false);
};

module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;
  api.endpointConfig = body.endpointConfig;

  await api.emit(command, body);
  api.on._emit(command, body);

  if (!body.loggedInUser) {
    return await login();
  }

  api.currentSubscriber = new SubscriberObject(body.loggedInUser);

  return await onSuccess(api, true);
};
