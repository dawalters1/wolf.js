import BaseEvent from './BaseEvent.js';
import MessageSubscriptionType from '../../../constants/MessageSubscriptionType.js';
import { STATUS_CODES } from 'http';
import TipSubscriptionTargetType from '../../../constants/TipSubscriptionTargetType.js';
import Welcome from '../../../entities/Welcome.js';

export default class WelcomeEvent extends BaseEvent {
  constructor (client) {
    super(client, 'welcome');
  }

  async #synchronise () {
    const { channel, notification, messaging, tipping } =
    this.client.config.framework.subscriptions;

    const sessionContext = {
      user: await this.client.user.fetch(
        this.client.config.framework.login.userId
      )
    };

    const tasks = {
      channels: channel.list && this.client.channel.fetch({ forceNew: true }),

      userNotifications: notification.user && this.client.notification.user.fetch({ forceNew: true }),

      globalNotifications: notification.global && this.client.notification.global.fetch({ forceNew: true }),

      _channelMessageSubscription: messaging.channel && this.client.messaging.subscribe(MessageSubscriptionType.CHANNEL),

      _privateMessageSubscription: messaging.private && this.client.messaging.subscribe(MessageSubscriptionType.PRIVATE),

      _tipChannelSubscription: tipping.channel && this.client.tip.subscribe(TipSubscriptionTargetType.CHANNEL)
    };

    const entries = Object.entries(tasks)
      .filter(([, task]) => task !== false && task !== undefined);

    const results = await Promise.all(entries.map(([, task]) => task));

    for (let i = 0; i < entries.length; i++) {
      const [key] = entries[i];

      // only attach data we actually want on the context
      if (!key.startsWith('_')) {
        sessionContext[key.slice(1)] = results[i];
      }
    }

    return sessionContext;
  }

  async #login () {
    try {
      const { username, password, state } = this.client.config.framework.login;

      const response = await this.client.websocket.emit(
        'security login',
        {
          headers: {
            version: 2
          },
          body: {
            type: 'email',
            onlineState: state,
            username,
            password
          }
        }
      );

      this.client.loggedIn = true;
      this.client.config.framework.login.userId = response.body.subscriber?.id;
      this.client.config.cognito = response.body.cognito;

      this.client.emit('loginSuccess', await this.#synchronise());

      return true;
    } catch (error) {
      if (this.client.loggedIn) { throw error; } // Error occurred during sync

      this.client.emit('loginFailed', error);

      const subCode = error.headers?.get('subCode') ?? -1;
      if (subCode > 1) { return false; }

      await this.client.utility.delay(this.client.utility.number.random(100, 5000));

      return await this.#login();
    }
  }

  async process (data) {
    const welcome = new Welcome(this.client, data);
    const loggedInUserChanged = this.client.me && welcome.loggedInUser && welcome.loggedInUser.id !== this.client.me.id;

    this.client.config.framework.login.userId = welcome.loggedInUser?.id ?? undefined;

    this.client.config.endpointConfig = welcome.endpointConfig;
    this.client.config.cognito = loggedInUserChanged
      ? this.client.config.cognito
      : undefined;

    if (welcome.loggedInUser === null) {
      const successfulLogin = await this.#login();

      if (!successfulLogin) { return; }
    } else {
      this.client.emit('resume', await this.synchronise());
    }

    this.client.loggedIn = true;
    return this.client.emit('ready');
  }
}
