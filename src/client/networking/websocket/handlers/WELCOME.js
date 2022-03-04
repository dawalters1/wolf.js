const SubscriberObject = require('../../../../models/SubscriberObject');
const { Events, Commands } = require('../../../../constants');

const onSuccess = async (api, reconnect = false) => {
  await api._cleanup(false);

  await api.group()._joinedGroups();

  const subscribe = async () => {
    const resps = await Promise.all([
      api.messaging()._messageGroupSubscribe(),
      api.messaging()._messagePrivateSubscribe(),
      api.tipping()._groupSubscribe()
    ]);

    if (resps.some((resp) => !resp.success)) {
      console.warn('[Subscriptions Failed]: Retrying');
      return await subscribe();
    };

    return Promise.resolve();
  };

  await subscribe();

  api._currentSubscriber = await api.subscriber().getById(api.currentSubscriber.id);

  api.emit(reconnect ? Events.RESUME : Events.READY);
};

const login = async (api) => {
  const loginSettings = api.config.get('_loginSettings');

  const result = await api.websocket.emit(
    Commands.SECURITY_LOGIN,
    {
      headers: {
        version: 2
      },
      body: {
        type: loginSettings.loginType,
        onlineState: loginSettings.onlineState,
        username: loginSettings.email,
        password: loginSettings.password,
        md5Password: false
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
  api._currentSubscriber = result.body.subscriber;
  api._currentSubscriber.token = api.config.get('_loginSettings.token');

  api.emit(
    Events.LOGIN_SUCCESS,
    api.currentSubscriber
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
