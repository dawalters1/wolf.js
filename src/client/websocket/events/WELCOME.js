import BaseEvent from './baseEvent.js';
import BaseHelper from '../../../helper/baseHelper.js';
import { Command } from '../../../constants/Command.js';
import Welcome from '../../../entities/welcome.js';

// Lets not wipe important data on reconnect
const excludeOnCleanup = ['AudioHelper', 'BannedHelper', 'AuthorisationHelper'];

export class WelcomeEvent extends BaseEvent {
  constructor (client) {
    super(client, 'welcome');
  }

  async synchronise () {
    const { channel, notification, messaging } = this.client.config.framework.subscriptions;

    const sessionContext = {
      user: await this.client.user.getById(this.client.config.framework.login.userId)
    };

    const subscriptions = [
      ['channels', channel.list ? this.client.channel.list({ forceNew: true }) : undefined],
      ['userNotifications', notification.user ? this.client.notification.user.list({ forceNew: true }) : undefined],
      ['globalNotifications', notification.global ? this.client.notification.global.list({ forceNew: true }) : undefined],
      [null, messaging.channel ? this.client.messaging._subscribeToChannel() : undefined],
      [null, messaging.private ? this.client.messaging._subscribeToPrivate() : undefined]
    ];

    const results = await Promise.all(subscriptions.map(([, promise]) => promise));

    return subscriptions.reduce((context, [key], index) => {
      if (key && results[index] !== undefined) {
        context[key] = results[index];
      }
      return context;
    }, sessionContext);
  }

  async cleanup (base) {
    const helpers = Object.keys(base)
      .filter(key => base[key] instanceof BaseHelper)
      .map(key => base[key])
      .filter(helper => !excludeOnCleanup.includes(helper.constructor.name));

    helpers.forEach(helper => {
      helper.cache.clear();
      this.cleanup(helper); // recursive clear
    });
  }

  async login () {
    const { username, password, state } = this.client.config.framework.login;

    const response = await this.client.websocket.emit(
      Command.SECURITY_LOGIN,
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

    if (!response.success) {
      this.client.emit('loginFailed', response);

      const subCode = response.headers?.get('subCode') ?? -1;
      if (subCode > 1) { return false; }

      return await this.login(); // Retry login
    }

    this.client.config.framework.login.userId = response.body.subscriber?.id;
    this.client.config.cognito = response.body.cognito;

    this.client.emit('loginSuccess', await this.synchronise());
    return true;
  }

  async process (data) {
    const welcome = new Welcome(this.client, data);

    this.cleanup(this.client);
    this.client.emit('welcome', welcome);

    this.client.config.endpointConfig = welcome.endpointConfig;

    const isSameUser = welcome.loggedInUser?.id === this.client.me?.id;
    this.client.config.cognito = isSameUser ? this.client.config.cognito : undefined;

    if (welcome.loggedInUser === null) {
      const success = await this.login();
      if (!success) { return; }
    } else {
      this.client.config.framework.login.userId = welcome.loggedInUser.id;
      this.client.emit('resume', await this.synchronise());
    }

    this.client.loggedIn = true;
    this.client.emit('ready');
  }
}

export default WelcomeEvent;
