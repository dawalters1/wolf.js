import Base from './Base.js';
import ContactAdditionalInfo from './ContactAdditionalInfo.js';
class Contact extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.additionalInfo = new ContactAdditionalInfo(client, data?.additionalInfo);
  }
}
export default Contact;
