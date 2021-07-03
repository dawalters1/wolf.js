const BaseEvent = require('../BaseEvent');
const internal = require('../../../constants/internal');
const event = require('../../../constants/event');

const { adminAction, messageType, capability, privilege } = require('@dawalters1/constants');
const toGroupMemberCapability = require('../../../utils/toGroupMemberCapability');
const { version } = require('../../../package.json');

const secrets = {

  '>reveal your secrets': [
    "I'd love to stay and chat, but I'm lying.\nWOLF.js: {version}",
    'Hey, I found your nose... It was in my Business\nWOLF.js: {version}',
    'In my defense, I was left unsupervised\nWOLF.js: {version}',
    'I am a bot using\nWOLF.js: {version}',
    'Maybe you should get your own life and stop interfering in mine\nWOLF.js: {version}',
    'Nothing will bring you greater peace than minding your own business.\nWOLF.js: {version}',
    'I am who I am, your approval isnt needed\nWOLF.js: {version}'
  ],
  '>sırlarını ifşala': [
    'Kalıp sizinle sohbet etmek istiyorum derdim ama, yalan olur.\nWOLF.js: {version}',
    'Ayy burnunu buldum… Benim işlerimin arasından çıktı.\nWOLF.js: {version}',
    'Kendimi savunmak için diyorum, gözetimsiz bırakılmıştım\nWOLF.js: {version}',
    'Güzel selfi çekmek için 10 resim çekiyorsan, çirkinsin; bunun ötesi berisi yok.\nWOLF.js: {version}',
    'Gidince arkasından üzüleceğim tek şey, internet.\nWOLF.js: {version}'
  ],
  '>اكشف اسرارك': [
    'اود ان ارغب في الاستمرار بالمحادثه ولكن في الحقيقه لا ارغب بذلك\nWOLF.js: {version}',
    'خذ انفك، وجدته في مكان لا يخصه\nWOLF.js: {version}',
    'لنكن منصفين مصممي تركني من غير مراقبة\nWOLF.js: {version}',
    'انا بوت استخدم\nWOLF.js: {version}',
    'مارأيك بالاهتمام بحياتك بدلا من الاهتمام بحياة الغير\nWOLF.js: {version}',
    'لا يوجد شيء يجلب لك السلام إلا الاهتمام باشغالك\nWOLF.js: {version}'
  ]

};

module.exports = class MessageSend extends BaseEvent {
  async process (data) {
    const message = {
      id: data.id,
      body: data.data.toString().trim(),
      sourceSubscriberId: data.originator.id ? data.originator.id : data.originator,
      targetGroupId: data.isGroup ? data.recipient.id ? data.recipient.id : data.recipient : null,
      embeds: data.embeds,
      metadata: data.metadata,
      isGroup: data.isGroup,
      timestamp: data.timestamp,
      edited: data.edited,
      type: data.mimeType,
      isCommand: this._bot.commandHandler.isCommand(data.data.toString())
    };

    switch (message.messageType) {
      case messageType.APPLICATION_PALRINGO_GROUP_ACTION:
        {
          const group = await this._bot.group().getById(message.targetGroupId);

          const subscriber = await this._bot.subscriber().getById(message.sourceSubscriberId);

          const action = JSON.parse(message.body);
          switch (action.type) {
            case adminAction.JOIN: {
              group.subscribers.add({
                subscriberId: subscriber.id,
                groupId: group.id,
                capabilities: group.owner.id === subscriber.id ? capability.OWNER : capability.REGULAR,
                additionalInfo: {
                  hash: subscriber.hash,
                  nickname: subscriber.nickname,
                  privileges: subscriber.privileges,
                  onlineState: subscriber.onlineState
                }
              });

              if (message.sourceSubscriberId === this._bot.currentSubscriber.id) {
                group.capabilities = group.owner.id === subscriber.id ? capability.OWNER : capability.REGULAR;
                group.inGroup = true;

                this._bot.on._emit(internal.JOINED_GROUP, group);
              } else {
                this._bot.on._emit(event.GROUP_MEMBER_ADD, group, subscriber);
              }
            }
            // eslint-disable-next-line no-fallthrough
            default: {
              if (action.type === adminAction.LEAVE && action.instigatorId !== 0) {
                action.type = adminAction.KICK;
              }
              if (message.sourceSubscriberId === this._bot.currentSubscriber.id) {
                group.capabilities = toGroupMemberCapability(action.type);

                if (group.capabilities === capability.NOT_MEMBER) {
                  group.inGroup = false;
                  group.subscribers = [];

                  this._bot.group()._messageGroupUnsubscribe(group.id);
                }
              } else {
                if (group.subscribers) {
                  const member = group.subscribers.find((groupSubscriber) => groupSubscriber.subscriberId === subscriber.id);

                  if (member) {
                    if (action.type === adminAction.OWNER) {
                      group.owner = subscriber.hash;
                    }

                    if (member) {
                      if (action.type === adminAction.KICK || action.type === adminAction.LEAVE) {
                        group.subscribers.splice(group.subscribers.indexOf(member), 1);
                      } else {
                        member.capabilities = toGroupMemberCapability(action.type);
                      }
                    }
                  }
                }
                if (action.type === adminAction.LEAVE) {
                  this._bot.on._emit(subscriber.id === this._bot.currentSubscriber.id ? internal.LEFT_GROUP : event.GROUP_MEMBER_DELETE, group, subscriber);
                } else {
                  this._bot.on._emit(event.GROUP_MEMBER_UPDATE,
                    {
                      group,
                      action: {
                        groupId: group.id,
                        sourceId: action.instigatorId,
                        targetId: message.sourceSubscriberId,
                        action: action.type
                      }
                    });
                }
              }
            }
          }
        }
        break;

      case messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE: {
        this._bot.on._emit(internal.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await this._bot.subscriber().getById(message.sourceSubscriberId));
      }
    }

    if (message.sourceSubscriberId === this._bot.currentSubscriber.id) {
      return Promise.resolve();
    }

    const reveal = Object.entries(secrets).find((secret) => secret[0].toLowerCase().trim() === message.body.toLowerCase().trim());

    if (reveal) {
      if (await this._bot.utility().privilege().has(message.sourceSubscriberId, [privilege.STAFF, privilege.VOLUNTEER])) {
        const body = this._bot.utility().string().replace(reveal[1][Math.floor(Math.random() * reveal[1].length)], {
          version
        });

        if (message.isGroup) {
          return await this._bot.messaging().sendGroupMessage(message.targetGroupId, body);
        }
        return await this._bot.messaging().sendPrivateMessage(message.sourceSubscriberId, body);
      }
    }

    return this._bot.on._emit(this._command, message);
  }
};
