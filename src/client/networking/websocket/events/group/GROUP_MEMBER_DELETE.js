const { Events, Capability } = require('../../../../../constants');

module.exports = async (api, body) => {
  const [group, subscriber] = await Promise.all([
    api.group().getById(body.groupId),
    api.subscriber().getById(body.subscriberId)
  ]);

  if (group.subscribers && group.subscribers.length > 0) {
    const member = group.subscribers.find((sub) => sub.id === body.subscriberId);

    if (member) {
      group.subscribers.splice(group.subscribers.findIndex((mb) => mb === member), 1);
    }
  }

  if (body.subscriberId === api.currentSubscriber.id) {
    group.capabilities = Capability.NOT_MEMBER;
    group.inGroup = false;
    group.subscribers = [];
    return api.emit(Events.LEFT_GROUP, group);
  }

  return api.emit(
    Events.GROUP_EVENT_DELETE,
    group,
    subscriber
  );
};
