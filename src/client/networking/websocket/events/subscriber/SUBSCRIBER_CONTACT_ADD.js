const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const subscriber = await api._subscriber.getById(body.targetId);

  const contact = {
    id: subscriber.id,
    additionalInfo: {
      hash: subscriber.hash,
      nickname: subscriber.nickname,
      onlineState: subscriber.onlineState,
      privileges: subscriber.privileges
    }
  };

  api._contact._contacts.push(contact);

  return await api.emit(
    Events.SUBSCRIBER_CONTACT_ADD,
    contact
  );
};
