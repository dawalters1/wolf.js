const SubscriberObject = require('../../../../../models/SubscriberObject');
const { Events, Commands } = require('../../../../../constants');

const subscribeToSubscriptionType = async (api, type) => {
  switch (type) {
    case 'groupMessages':
      return await api.messaging()._messageGroupSubscribe();
    case 'privateMessages':
      return await api.messaging()._messagePrivateSubscribe();
    case 'groupTipping':
      return await api.tipping()._groupSubscribe();
    default:
      throw new Error('invalid subscription type');
  }
};

const onSuccess = async (api, resume = false) => {
  await api._cleanup(false);

  await api.group()._joinedGroups();

  const subscriptions = Object.entries(api.config.get('app.messageSettings.subscriptions')).filter((entry) => entry[1]).map((entry) => entry[0]);

  for (const subscription of subscriptions) {
    await subscribeToSubscriptionType(api, subscription);
  }

  api._currentSubscriber = await api.subscriber().getById(api.currentSubscriber.id);

  api.emit(resume ? Events.RESUME : Events.READY);
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
