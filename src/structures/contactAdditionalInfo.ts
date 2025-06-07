import BaseEntity from './baseEntity.ts';
import { User } from './user';
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

  constructor (client: WOLF, data: ServerContactAdditionalInfo | User) {
    super(client);

    if ('nicknameShort' in data) {
      this.nicknameShort = data.nicknameShort;
      this.onlineState = data.onlineState;
    } else {
      this.nicknameShort = data.nickname;
      this.onlineState = data.presence.state;
    }

    this.hash = data.hash;
    this.privileges = data.privileges;
  }

  patch (entity: any): this {
    return this;
  }
}
export default ContactAdditionalInfo;
