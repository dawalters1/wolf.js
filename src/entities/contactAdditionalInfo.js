import BaseEntity from './BaseEntity.js';

export default class ContactAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.nicknameShort = entity?.nicknameShort ?? entity.nickname;
    this.onlineState = entity?.onlineState ?? entity.presenceStore.value.state;
    this.hash = entity.hash;
    this.privileges = entity.privileges;
  }
}
