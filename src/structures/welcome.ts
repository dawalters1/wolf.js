import BaseEntity from './baseEntity';
import { DeviceType, UserPresence, UserPrivilege } from '../constants';
import EndpointConfig, { ServerEndpointConfig } from './endpointConfig';
import WOLF from '../client/WOLF';

export interface ServerLoginSubscriber {
  id: number;
  hash: string;
  privileges: UserPrivilege;
  status: string | null;
  nickname: string;
  icon: number;
  onlineState: UserPresence;
  deviceType: DeviceType
  reputation: number;
}

export interface ServerWelcome {
    ip: string;
    country: string;
    loggedInUser: ServerLoginSubscriber | null;
    token: string;
    endpointConfig: ServerEndpointConfig
}

export class Welcome extends BaseEntity {
  ip: string;
  country: string;
  loggedInUser: ServerLoginSubscriber | null;
  isLoggedIn: boolean = false;
  token: string;
  endpointConfig: EndpointConfig;

  constructor (client: WOLF, data: ServerWelcome) {
    super(client);

    this.ip = data.ip;
    this.country = data.country;
    this.loggedInUser = data?.loggedInUser;
    this.isLoggedIn = data.loggedInUser !== null;
    this.token = data.token;
    this.endpointConfig = new EndpointConfig(client, data.endpointConfig);
  }
}

export default Welcome;
