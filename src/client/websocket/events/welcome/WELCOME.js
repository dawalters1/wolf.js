import { Command, Event, ServerEvent } from '../../../../constants/index.js';
import models from '../../../../models/index.js';
import Base from '../Base.js';

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

class Welcome extends Base {
  constructor (client) {
    super(client, ServerEvent.WELCOME);
  }

  async login () {
    const { email: username, password, type, onlineState } = this.client.config.get('framework.login');

    if (!username) { return false; }

    const response = await this.client.websocket.emit(
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
      this.client.emit(
        Event.LOGIN_FAILED,
        response
      );

      // Check if code is greater than 1 if so, bot is barred, attempt reconnect
      if (!(response?.headers?.subCode ?? -1 > 1)) { return false; }

      await this.client.utility.delay(90000);

      return await this.login(this.client);
    }

    this.client.currentSubscriber = response.body.subscriber;

    this.client.emit(
      Event.LOGIN_SUCCESS,
      this.client.currentSubscriber
    );

    return await fininaliseConnection(this.client, false);
  };

  async process (body) {
    this.client._cleanUp(body.loggedInUser === undefined);

    const welcome = new models.Welcome(this.client, body);

    if (welcome.subscriber?.id !== this.client.currentSubscriber?.id) {
      this.this.client.cognito = undefined;
    }

    this.client.config.endpointConfig = welcome.endpointConfig;
    this.client.currentSubscriber = welcome.subscriber;

    this.client.currentSubscriber
      ? fininaliseConnection(this.client, true)
      : this.login(this.client);

    return this.client.emit(
      Event.WELCOME,
      welcome
    );
  }
}

export default Welcome;
