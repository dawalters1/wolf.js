import BaseEntity from './baseEntity.ts';
import { UserPresence, UserPrivilege } from '../constants/index.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerContactAdditionalInfo {
  hash: string;
  nicknameShort: string;
  privileges: UserPrivilege;
  onlineState: UserPresence;
}

export class ContactAdditionalInfo extends BaseEntity {
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
