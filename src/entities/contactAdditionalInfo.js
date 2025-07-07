
import BaseEntity from './baseEntity.js';

export class ContactAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    if ('nicknameShort' in entity) {
      this.nicknameShort = entity.nicknameShort;
      this.onlineState = entity.onlineState;
    } else {
      this.nicknameShort = entity.nickname;
      this.onlineState = entity._presence.state;
    }

    this.hash = entity.hash;
    this.privileges = entity.privileges;
  }

  patch (entity) {
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
