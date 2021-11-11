const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  const subscriber = await api.subscriber().getById(body.targetId);

  const contact = {
    id: subscriber.id,
    additionalInfo: {
      hash: subscriber.hash,
      nickname: subscriber.nickname,
      onlineState: subscriber.onlineState,
      privileges: subscriber.privileges
    }
  };

  api.contact()._contacts.push(contact);

  return await api.emit(
    events.SUBSCRIBER_CONTACT_ADD,
    contact
  );
};
