
import BaseEntity from './baseEntity.js';

export class ContactAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    if ('nicknameShort' in entity) {
      this.nicknameShort = entity.nicknameShort;
      this.onlineState = entity.onlineState;
    } else {
      this.nicknameShort = entity.nickname;
      this.onlineState = entity.presenceStore.state;
    }

    this.hash = entity.hash;
    this.privileges = entity.privileges;
  }
}
export default ContactAdditionalInfo;
