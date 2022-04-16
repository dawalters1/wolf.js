const { Events } = require('../../../../../constants');
const GroupSubscriber = require('../../../../../models/GroupSubscriberObject');

module.exports = async (api, body) => {
  const [group, subscriber] = await Promise.all([
    api._group.getById(body.groupId),
    api._subscriber.getById(body.subscriberId)
  ]);

  if (group.subscribers && group.subscribers.length > 0) {
    group.subscribers.push(new GroupSubscriber(api,
      {
        id: subscriber.id,
        capabilities: body.capabilities,
        additionalInfo: {
          hash: subscriber.hash,
          nickname: subscriber.nickname,
          privileges: subscriber.privileges,
          onlineState: subscriber.onlineState
        }
      },
      group.id
    ));
  }

  if (body.subscriberId === api.currentSubscriber.id) {
    group.capability = body.capabilities;
    group.inGroup = true;
    return api.emit(Events.JOINED_GROUP, group);
  }

  group.members++;

  return api.emit(
    Events.GROUP_MEMBER_ADD,
    group,
    subscriber
  );
};
