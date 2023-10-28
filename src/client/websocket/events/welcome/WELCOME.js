import { Command, Event } from '../../../../constants/index.js';
import { Welcome } from '../../../../models/index.js';

const subscriptions = async (client) => {
  const promiseArray = [];

  if (client.config.framework.subscriptions.messages.channel.enabled) {
    promiseArray.push(client.messaging._subscribeToChannel());
  }

  if (client.config.framework.subscriptions.messages.private.enabled) {
    promiseArray.push(client.messaging._subscribeToPrivate());
  }

  if (client.config.framework.subscriptions.messages.channel.tipping) {
    promiseArray.push(client.tipping._subscribeToChannel());
  }

  await Promise.all(promiseArray);
};

const fininaliseConnection = async (client, resume = false) => {
  console.log('FINALIZING');
  await Promise.all(
    [
      client.channel.list(),
      client.subscriber.getById(client.currentSubscriber.id)
    ]
  );

  await subscriptions(client);

  client.config.subscriberId = client.currentSubscriber.id;

  return client.emit(resume ? Event.RESUME : Event.READY);
};

const login = async (client) => {
  const { email: username, password, loginType: type, onlineState } = client.config.get('framework.login');

  if (!username) {
    return Promise.resolve();
  }

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
    if (!(response?.headers?.subCode ?? -1 > 1)) { return false; }

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

/**
 * @param {import('../../../WOLF.js').default} client
 */
const handlePacket = async (client, body) => {
  client._cleanUp(body.loggedInUser === undefined);

  const welcome = new Welcome(client, body);

  if (welcome.subscriber?.id !== client.currentSubscriber?.id) {
    this.client.cognito = undefined;
  }

  client.config.endpointConfig = welcome.endpointConfig;
  client.currentSubscriber = welcome.subscriber;

  client.currentSubscriber
    ? fininaliseConnection(client, true)
    : login(client);

  return client.emit(
    Event.WELCOME,
    welcome
  );
};

export {
  login,

  handlePacket as default
};
