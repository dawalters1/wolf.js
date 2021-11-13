const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  const contact = api.contact()._contacts.find((contact) => contact.id === body.targetId);

  if (contact) {
    api.contact()._contacts.splice(api.contact()._contacts.indexOf(contact), 1);
  }

  return await api.emit(
    Events.SUBSCRIBER_CONTACT_DELETE,
    contact
  );
};
