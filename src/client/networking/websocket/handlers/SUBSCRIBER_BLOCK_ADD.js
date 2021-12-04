const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  const subscriber = await api.subscriber().getById(body.targetId);

  const blocked = {
    id: subscriber.id,
    additionalInfo: {
      hash: subscriber.hash,
      nickname: subscriber.nickname,
      onlineState: subscriber.onlineState,
      privileges: subscriber.privileges
    }
  };

  api.blocked()._blocked.push(blocked);

  return await api.emit(
    Events.SUBSCRIBER_BLOCK_ADD,
    blocked
  );
};
