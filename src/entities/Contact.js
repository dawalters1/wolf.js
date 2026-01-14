import BaseEntity from './BaseEntity.js';
import ContactAdditionalInfo from './ContactAdditionalInfo.js';

export default class Contact extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    const additionalInfo = 'additionalInfo' in entity
      ? entity.additionalInfo
      : entity;
    this.additionalInfo = new ContactAdditionalInfo(client, additionalInfo);
  }
}
