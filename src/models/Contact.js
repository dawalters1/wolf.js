import Base from './Base.js';
import ContactAdditionalInfo from './ContactAdditionalInfo.js';

class Contact extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.additionalInfo = new ContactAdditionalInfo(client, data?.additionalInfo);
  }

  async block () {
    return await this.client.contact.blocked.block(this.id);
  }

  async unblock () {
    return await this.client.contact.blocked.unblock(this.id);
  }

  async add () {
    return await this.client.contact.add(this.id);
  }

  async delete () {
    return await this.client.contact.delete(this.id);
  }

  async profile () {
    return await this.client.subscriber.getById(this.id);
  }
}

export default Contact;
