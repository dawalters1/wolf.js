const BaseEvent = require('../BaseEvent');
const internal = require('../../../constants/internal');
const event = require('../../../constants/event');

const { messageType, capability, privilege } = require('@dawalters1/constants');
const toAdminActionFromString = require('../../../internalUtils/toAdminActionFromString');
const toGroupMemberCapability = require('../../../internalUtils/toGroupMemberCapability');
const { version } = require('../../../package.json');

const secrets = {

  '>reveal your secrets': [
    "I'd love to stay and chat, but I'm lying.\nWOLF.js: {version}",
    'Hey, I found your nose... It was in my Business.\nWOLF.js: {version}',
    'In my defense, I was left unsupervised.\nWOLF.js: {version}',
    'I am a bot using.\nWOLF.js: {version}',
    'Maybe you should get your own life and stop interfering in mine.\nWOLF.js: {version}',
    'Nothing will bring you greater peace than minding your own business.\nWOLF.js: {version}',
    'I am who I am, your approval isnt needed.\nWOLF.js: {version}',
    'Where\'s your off button?\nWOLF.js: {version}',
    'Oops! I forgot the world revolves around you, how silly of me.\nWOLF.js: {version}',
    'If you listen closely you can hear me not caring.\nWOLF.js: {version}',
    'I smile, just not when you are around.\nWOLF.js: {version}',
    'If you have a problem with me, tell me, not anyone else.\nWOLF.js: {version}',
    'Sorry, sarcasm falls out of my mouth like stupidity falls out of yours.\nWOLF.js: {version}',
    'You\'re so fake, Barbie is jelous.\nWOLF.js: {version}',
    'I love the sound you make when you shut up.\nWOLF.js: {version}'
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
    'لا يوجد شيء يجلب لك السلام إلا الاهتمام باشغالك\nWOLF.js: {version}',
    'وين زر ايقاف التشغيل الخاص بك؟🤔\nWOLF.js: {version}',
    'اوووه، نسيت ان العالم يدور حولك 😏.\nWOLF.js: {version}',
    'لو تركز قليلاً لوجدت اني لا أهتم 🙃.\nWOLF.js: {version}',
    'انا سعيد. ولكن بدون تواجدك حولي\nWOLF.js: {version}',
    'اذا كان هنالك مشكله بي. اعلمني انا وليس غيري\nWOLF.js: {version}',
    'المعذره، السخريه على لساني دائماً، مثل ما الغباء على لسانك😏.\nWOLF.js {version}'
  ]

};

/**
 * {@hideconstructor}
 */
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
      type: data.mimeType
    };

    message.isCommand = this._api.commandHandler().isCommand(message);

    switch (message.type) {
      case messageType.APPLICATION_PALRINGO_GROUP_ACTION:
        {
          const group = await this._api.group().getById(message.targetGroupId);

          const subscriber = await this._api.subscriber().getById(message.sourceSubscriberId);

          const action = JSON.parse(message.body);

          switch (action.type) {
            case 'join': {
              if (group && group.subscribers) {
                group.subscribers.push({
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
              }
              if (message.sourceSubscriberId === this._api.currentSubscriber.id) {
                group.capabilities = group.owner.id === subscriber.id ? capability.OWNER : capability.REGULAR;
                group.inGroup = true;
              }

              this._api.on._emit(message.sourceSubscriberId === this._api.currentSubscriber.id ? internal.JOINED_GROUP : event.GROUP_MEMBER_ADD, group, subscriber);

              break;
            }
            // eslint-disable-next-line no-fallthrough
            default: {
              if (action.type === 'leave' && action.instigatorId) {
                action.type = 'kick';
              }

              if (message.sourceSubscriberId === this._api.currentSubscriber.id) {
                group.capabilities = toGroupMemberCapability(toAdminActionFromString(action.type));

                if (group.capabilities === capability.NOT_MEMBER || group.capabilities === capability.BANNED) {
                  group.inGroup = false;
                  group.subscribers = [];

                  await this._api.messaging()._messageGroupUnsubscribe(group.id);
                }
              } else {
                if (group.subscribers) {
                  const member = group.subscribers.find((groupSubscriber) => groupSubscriber.subscriberId === subscriber.id);

                  if (member) {
                    if (action.type === 'owner') {
                      group.owner = subscriber.hash;
                    }

                    if (member) {
                      if (action.type === 'kick' || action.type === 'leave') {
                        group.subscribers.splice(group.subscribers.indexOf(member), 1);
                      } else {
                        member.capabilities = toGroupMemberCapability(toAdminActionFromString(action.type));
                      }
                    }
                  }
                }
              }

              if (action.type === 'leave' || action.type === 'kick') {
                this._api.on._emit(subscriber.id === this._api.currentSubscriber.id ? internal.LEFT_GROUP : event.GROUP_MEMBER_DELETE, group, subscriber);
              } else {
                this._api.on._emit(event.GROUP_MEMBER_UPDATE,
                  group,
                  {
                    groupId: group.id,
                    sourceId: action.instigatorId,
                    targetId: message.sourceSubscriberId,
                    action: action.type
                  });
              }
              break;
            }
          }
        }
        break;

      case messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE: {
        this._api.on._emit(internal.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await this._api.subscriber().getById(message.sourceSubscriberId));
      }
    }

    if (message.sourceSubscriberId === this._api.currentSubscriber.id) {
      return Promise.resolve();
    }

    const reveal = Object.entries(secrets).find((secret) => secret[0].toLowerCase().trim() === message.body.toLowerCase().trim());

    if (reveal) {
      if (this._api.options.developerId === message.sourceSubscriberId || await this._api.utility().subscriber().privilege().has(message.sourceSubscriberId, [privilege.STAFF, privilege.VOLUNTEER])) {
        const body = this._api.utility().string().replace(reveal[1][Math.floor(Math.random() * reveal[1].length)], {
          version
        });

        if (message.isGroup) {
          return await this._api.messaging().sendGroupMessage(message.targetGroupId, body);
        }
        return await this._api.messaging().sendPrivateMessage(message.sourceSubscriberId, body);
      }
    }

    const messageSubscriptions = this._api.messaging()._messageSubscriptions.filter((subscription) => subscription.predicate(message));

    if (messageSubscriptions.length > 0) {
      for (const messageSubscription of messageSubscriptions) {
        if (messageSubscription.timeoutInterval) {
          clearTimeout(messageSubscription.timeoutInterval);
        }

        this._api.messaging()._messageSubscriptions = this._api.messaging()._messageSubscriptions.filter((subscription) => subscription.subscriptionId !== messageSubscription.subscriptionId);
        this._api.messaging()._deferreds[messageSubscription.subscriptionId].resolve(message);
      }
    }

    this._api.on._emit(message.isGroup ? internal.GROUP_MESSAGE : internal.PRIVATE_MESSAGE, message);

    return this._api.on._emit(this._command, message);
  }
};
