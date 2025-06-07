import BaseEvent from './baseEvent.ts';
import BaseHelper from '../../../helper/baseHelper';
import Channel from '../../../structures/channel';
import { Cognito } from '../../../structures/cognito';
import { Command } from '../../../constants/Command';
import { User } from '../../../structures/user';
import Welcome, { ServerLoginSubscriber, ServerWelcome } from '../../../structures/welcome';
import WOLF from '../../WOLF.ts';
import WOLFResponse from '../../../structures/WOLFResponse';

// Lets not wipe important data on reconnect
const excludeOnCleanup = ['AudioHelper', 'BannedHelper', 'AuthorisationHelper'];

interface Login {
  cognito: Cognito
  subscriber: ServerLoginSubscriber | null;
  isNew: boolean
}

export interface SessionContext {
  user: User;
  channels?: Channel[];
  globalNotifications?: Notification[];
  userNotifications?: Notification[];
  channelMessageSubscription: WOLFResponse,
  privateMessageSubscription: WOLFResponse
}

class WelcomeEvent extends BaseEvent<ServerWelcome> {
  constructor (client: WOLF) {
    super(client, 'welcome');
  }

  async synchronise (): Promise<SessionContext> {
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
    ] as const;

    const results = await Promise.all(subscriptions.map(([, p]) => p));

    return subscriptions.reduce((context: any, [key], index) => {
      if (key && results[index] !== undefined) {
        context[key] = results[index];
      }
      return context;
    }, sessionContext);
  }

  async cleanup (base: WOLF | BaseHelper<any>) {
    const helpers = Object.keys(base)
      .filter((key) => (base as any)[key] instanceof BaseHelper)
      .map((key) => (base as any)[key] as BaseHelper<any>)
      .filter((helper) => !excludeOnCleanup.includes(helper.constructor.name));

    helpers.forEach((helper) => {
      helper.cache.clear();

      this.cleanup(helper); // recursive clear, check for children helpers
    });
  }

  async login (): Promise<boolean> {
    const { username, password, state } = this.client.config.framework.login;

    const response = await this.client.websocket.emit<Login>(
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
      this.client.emit('loginFailed', response as unknown as WOLFResponse);

      const subCode = (response.headers?.get('subCode') ?? -1) as number;

      if (subCode > 1) { return false; }

      return await this.login();
    }

    // TODO:
    this.client.config.framework.login.userId = response.body.subscriber?.id;
    this.client.config.cognito = response.body.cognito;

    this.client.emit('loginSuccess', await this.synchronise());

    return true;
  }

  async process (data: ServerWelcome): Promise<void> {
    const welcome = new Welcome(this.client, data);

    this.cleanup(this.client);

    this.client.emit('welcome', welcome);

    this.client.config.endpointConfig = welcome.endpointConfig;

    this.client.config.cognito = welcome.loggedInUser?.id === this.client.me?.id
      ? this.client.config.cognito
      : undefined;

    if (welcome.loggedInUser === null) {
      const wasSuccess = await this.login();
      if (!wasSuccess) { return; }
    } else {
      this.client.config.framework.login.userId = welcome.loggedInUser.id;
      this.client.emit('resume', await this.synchronise());
    }

    this.client.emit('ready');
  }
}

export default WelcomeEvent;
