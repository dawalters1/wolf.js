import Base from './Base.js';
import ContactAdditionalInfo from './ContactAdditionalInfo.js';

class Contact extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.additionalInfo = new ContactAdditionalInfo(client, data?.additionalInfo);
  }

  /**
   * Add the subscriber to the bots blocked list
   * @returns {Promise<Response>}
   */
  async block () {
    return await this.client.contact.blocked.block(this.id);
  }

  /**
   * Remove the subscriber from the bots blocked list
   * @returns {Promise<Response>}
   */
  async unblock () {
    return await this.client.contact.blocked.unblock(this.id);
  }

  /**
   * Add the subscriber as a contact
   * @returns {Promise<Response>}
   */
  async add () {
    return await this.client.contact.add(this.id);
  }

  /**
   * Delete the subscriber as a contact
   * @returns {Promise<Response>}
   */
  async delete () {
    return await this.client.contact.delete(this.id);
  }

  /**
   * Get the profile
   * @returns {Promise<Subscriber>}
   */
  async profile () {
    return await this.client.subscriber.getById(this.id);
  }
}

export default Contact;
