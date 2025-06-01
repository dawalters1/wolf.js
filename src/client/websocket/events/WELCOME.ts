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
    super(client, 'WELCOME');
  }

  async process (data: ServerWelcome): Promise<void> {

  }
}

export default Welcome;
