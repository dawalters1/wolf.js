import WOLF from '../client/WOLF.ts';
import { UserPrivilege, UserPresence } from '../constants/index.ts';
import Base from './base.ts';

export interface ServerContactAdditionalInfo {
  hash: string;
  nicknameShort: string;
  privileges: UserPrivilege;
  onlineState: UserPresence;
}

export class ContactAdditionalInfo extends Base {
  hash: string;
  nicknameShort: string;
  privileges: UserPrivilege;
  onlineState: UserPresence;

  constructor (client: WOLF, data: ServerContactAdditionalInfo) {
    super(client);

    this.hash = data.hash;
    this.nicknameShort = data.nicknameShort;
    this.privileges = data.privileges;
    this.onlineState = data.onlineState;
  }
}

export default ContactAdditionalInfo;
