const { Capability } = require('../../../../constants');

module.exports = async (api, body) => {
  const [group, subscriber] = await Promise.all([
    api.group().getById(body.groupId),
    api.subscriber().getById(body.subscriberId)
  ]);

  if (group.subscribers && group.subscribers.length > 0) {
    const member = group.subscribers.find((sub) => sub.id === body.subscriberId);

    if (member) {
      member.capabilities = body.capabilities;
    }
  }

  if (body.subscriberId === api.currentSubscriber.id) {
    group.capability = body.capabilities;
  }

  if (body.capabilities === Capability.OWNER) {
    group.owner = {
      hash: subscriber.hash,
      id: subscriber.id
    };
  }

  return Promise.resolve();
};
