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

  async delete () {
    return await this.client.contact.remove(this.id);
  }

  async block () {
    return await this.client.contact.blocked.add(this.id);
  }

  async unblock () {
    return await this.client.contact.blocked.remove(this.id);
  }
}
