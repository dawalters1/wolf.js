import BaseEntity from './baseEntity.ts';
import { User } from './user';
import { UserPresence, UserPrivilege } from '../constants/index.ts';
import WOLF from '../client/WOLF.ts';

export type ServerContactAdditionalInfo = {
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
      this.onlineState = data._presence.state;
    }

    this.hash = data.hash;
    this.privileges = data.privileges;
  }

  patch (entity: ServerContactAdditionalInfo | User): this {
    if ('nicknameShort' in entity) {
      this.nicknameShort = entity.nicknameShort;
      this.onlineState = entity.onlineState;
    } else {
      this.nicknameShort = entity.nickname;
      this.onlineState = entity._presence.state;
    }

    this.hash = entity.hash;
    this.privileges = entity.privileges;

    return this;
  }
}
export default ContactAdditionalInfo;
