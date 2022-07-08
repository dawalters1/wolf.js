const Base = require('./Base');
const ContactAdditionalInfo = require('./ContactAdditionalInfo');

class Contact extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;

    this.additionalInfo = new ContactAdditionalInfo(client, data.additionalInfo);
  }
  // TODO: Methods
}

module.exports = Contact;
