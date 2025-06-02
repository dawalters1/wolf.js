import BaseEvent from './baseEvent.ts';
import { ServerEndpointConfig } from '../../../structures/endpointConfig.ts';
import { ServerUser } from '../../../structures/user.ts';
import WOLF from '../../WOLF.ts';

type ServerWelcome = {
  ip: string;
  country: string;
  loggedInUser?: ServerUser;
  token: string;
  endpointConfig: ServerEndpointConfig
}

class Welcome extends BaseEvent {
  constructor (client: WOLF) {
    super(client, 'welcome');
  }

  async cleanup () {

  }

  async login () {

  }

  async process (data: any): Promise<void> {
    console.log('GOT WELCOME', data);
  }
}

export default Welcome;
