import { Command, Event } from '../../../../constants/index.js';
import { Welcome } from '../../../../models/index.js';

const subscriptions = async (client) => {
  if (client.config.framework.subscriptions.messages.group.enabled) {
    await client.messaging._subscribeToGroup();
  }

  if (client.config.framework.subscriptions.messages.private.enabled) {
    await client.messaging._subscribeToPrivate();
  }

  if (client.config.framework.subscriptions.messages.group.tipping) {
    await client.tipping._subscribeToGroup();
  }
};

const fininaliseConnection = async (client, resume = false) => {
  await Promise.all([
    client.group.list(),
    client.subscriber.getById(client.currentSubscriber.id)
  ]);

  await subscriptions(client);

  client.config.subscriberId = client.currentSubscriber.id;

  return client.emit(resume ? Event.RESUME : Event.READY);
};

const login = async (client) => {
  const { email: username, password, loginType: type, onlineState } = client.config.get('framework.login');
  const response = await client.websocket.emit(
    Command.SECURITY_LOGIN,
    {
      headers: {
        version: 2
      },
      body: {
        type,
        onlineState,
        username,
        password
      }
    }
  );

  if (!response.success) {
    client.emit(
      Event.LOGIN_FAILED,
      response
    );

    // Check if code is greater than 1 if so, bot is barred, attempt reconnect
    if (!(response?.headers?.subCode ?? -1 > 1)) {
      return Promise.resolve();
    }
    await client.utility.delay(90000);

    return await login(client);
  }

  client.currentSubscriber = response.body.subscriber;

  client.emit(
    Event.LOGIN_SUCCESS,
    client.currentSubscriber
  );

  return await fininaliseConnection(client, false);
};

export default async (client, body) => {
  await client._cleanUp(body.loggedInUser === undefined);

  const welcome = new Welcome(client, body);

  client.emit(
    Event.WELCOME,
    welcome
  );

  if (welcome.subscriber?.id !== client.currentSubscriber?.id) {
    this.client.cognito = undefined;
  }

  client.config.endpointConfig = welcome.endpointConfig;
  client.currentSubscriber = welcome.subscriber;

  return client.currentSubscriber ? await fininaliseConnection(client, true) : await login(client);
};
