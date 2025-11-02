import BaseEntity from './baseEntity.js';
import ContactAdditionalInfo from './contactAdditionalInfo.js';

export class Contact extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    const additionalInfo = 'additionalInfo' in entity
      ? entity.additionalInfo
      : entity;
    this.additionalInfo = new ContactAdditionalInfo(client, additionalInfo);
  }
}
export default Contact;
