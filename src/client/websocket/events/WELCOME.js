import BaseEvent from './BaseEvent.js';
import BaseHelper from '../../../helpers/BaseHelper.js';
import MessageSubscriptionType from '../../../constants/MessageSubscriptionType.js';
import { STATUS_CODES } from 'http';
import TipSubscriptionTargetType from '../../../constants/TipSubscriptionTargetType.js';
import Welcome from '../../../entities/Welcome.js';

const excludeOnCleanup = ['ChannelHelper', 'BannedHelper', 'AuthorisationHelper', 'PhraseHelper'];

export default class WelcomeEvent extends BaseEvent {
  constructor (client) {
    super(client, 'welcome');
  }

  async #synchronise () {
    const cleanupHelpers = async (instance, seen = new Set()) => {
      if (!instance || seen.has(instance)) { return; }
      seen.add(instance);

      const proto = Object.getPrototypeOf(instance);
      const getterKeys = Object.getOwnPropertyNames(proto)
        .filter(key => {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          return desc?.get;
        });

      for (const key of getterKeys) {
        const value = instance[key];

        if (!value || !(value instanceof BaseHelper)) { continue; }

        if (excludeOnCleanup.includes(value.constructor.name)) { this.client.log.debug(`[CleanUp]: Store Reset Skipped [store:${key}]`); continue; }

        value.resetStore();

        this.client.log.debug(`[CleanUp]: Store Reset [store:${key}]`);

        await cleanupHelpers(value, seen);
      }
    };

    await cleanupHelpers(this.client);

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

      channelMessageSubscription: messaging.channel && this.client.messaging.subscribe(MessageSubscriptionType.CHANNEL),

      privateMessageSubscription: messaging.private && this.client.messaging.subscribe(MessageSubscriptionType.PRIVATE),

      tipChannelSubscription: tipping.channel && this.client.tip.subscribe(TipSubscriptionTargetType.CHANNEL)
    };

    const entries = Object.entries(tasks)
      .filter(([, task]) => task !== false && task !== undefined);

    const results = await Promise.allSettled(entries.map(([, task]) => task));

    for (let i = 0; i < entries.length; i++) {
      const [key] = entries[i];
      const result = results[i];

      if (result.status === 'rejected') {
        this.client.log.debug(`[Synchronise]: Failure [key:${key}][reason:${result.reason}]`);
        this.client.emit(
          'synchroniseFailure',
          { key, error: result.reason }
        );
        continue;
      }

      this.client.log.debug(`[Synchronise]: Completed [key:${key}]`);
      sessionContext[key] = result.value;
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

      this.client.config.framework.login.userId = response.body.subscriber?.id;
      this.client.config.cognito = response.body.cognito;

      this.client.emit('loggedIn', response.body);

      this.client.log.debug(`[Login]: Logged in [profile:${JSON.stringify(response.body)}]`);
      return true;
    } catch (error) {
      if (this.client.loggedIn) { throw error; } // Error occurred during sync

      this.client.log.debug(`[Login]: Logged failed [reason:${JSON.stringify(error, null, 4)}]`);

      this.client.emit('loginFailed', error);

      const subCode = error.headers?.get('subCode') ?? null;

      if (subCode !== 2) { return false; }

      await this.client.utility.delay(this.client.utility.number.random(100, 1000));

      return await this.#login();
    }
  }

  async process (data) {
    const welcome = new Welcome(this.client, data);

    this.client.emit('welcome', welcome);

    const { loggedInUser, endpointConfig } = welcome;
    const currentUser = this.client.me;

    this.client.config.framework.login.userId = loggedInUser?.id;
    this.client.config.endpointConfig = endpointConfig;

    const userChanged =
      currentUser &&
      loggedInUser &&
      loggedInUser.id !== currentUser.id;

    if (userChanged) {
      this.client.log.debug('[Login]: User changed clearing cognito');
      this.client.config.cognito = undefined;
    }

    if (loggedInUser === null && !(await this.#login())) {
      return;
    }

    if (loggedInUser !== null) {
      this.client.log.debug('[Welcome]: Resume');
      this.client.emit('resume', loggedInUser);
    }

    await this.#synchronise();
    this.client.loggedIn = true;
    this.client.emit('ready');
  }
}
