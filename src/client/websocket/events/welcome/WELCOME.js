import { Command, Event } from '../../../../constants/index.js';
import SubscriptionIntent from '../../../../constants/SubscriptionIntent.js';
import { Welcome } from '../../../../models/index.js';

const subscribeToSubscriptionType = async (client, clientIntents) => {
  const intents = Object.values(SubscriptionIntent).filter((intent) => (clientIntents && intent) === intent);

  for (const intent of intents) {
    if (intent === SubscriptionIntent.GROUP_MESSAGE) {
      await client.messaging._subscribeToGroup();
    } else if (intent === SubscriptionIntent.PRIVATE_MESSAGE) {
      await client.messaging._subscribeToPrivate();
    } else if (intent === SubscriptionIntent.PRIVATE_MESSAGE_TIPPING) {
      await client.tipping._subscribeToGroup();
    }
  }
};
const fininaliseConnection = async (client, resume = false) => {
  await Promise.all([
    client.group.list(),
    client.subscriber.getById(client.currentSubscriber.id)
  ]);

  await subscribeToSubscriptionType(client.config.framework.subscriptions.intents);

  return client.emit(resume ? Event.RESUME : Event.READY);
};
const login = async (client) => {
  const { email: username, password, loginType: type, onlineState } = client.config.get('framework.login');
  const response = await client.websocket.emit(Command.SECURITY_LOGIN, {
    headers: {
      version: 2
    },
    body: {
      type,
      onlineState,
      username,
      password
    }
  });

  if (!response.success) {
    client.emit(
      Event.LOGIN_FAILED,
      response
    );

    // Check if code is greater than 1 if so, bot is barred, attempt reconnect
    if (!(response?.headers?.subCode ?? -1 > 1)) {
      return Promise.resolve();
    }
    await client.utility().delay(90000);

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
  const welcome = new Welcome(client, body);

  client.endpointConfig = welcome.endpointConfig;

  if (!welcome.subscriber) {
    return await login(client);
  }

  client.currentSubscriber = welcome.subscriber;

  return await fininaliseConnection(client, true);
};
