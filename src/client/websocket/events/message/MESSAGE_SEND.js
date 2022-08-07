import { MessageType, Event } from '../../../../constants/index.js';
import models from '../../../../models/index.js';
import messageSendAdminActionHandler from '../../../../utils/messageSendAdminActionHandler.js';

export default async (client, body) => {
  const message = new models.Message(client, body);
  switch (message.type) {
    case MessageType.APPLICATION_PALRINGO_GROUP_ACTION:
      await messageSendAdminActionHandler(client, message);
      break;
    case MessageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE:
      client.emit(Event.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await client.subscriber.getById(message.sourceSubscriberId));
      break;
    case MessageType.APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK:
      message.body = message.body.replace('token=TOKEN', `token=${client.config.get('login').token}`).replace('language=LANGUAGE', `language=${client.currentSubscriber.extended.language}`).replace('deviceType=DEVICETYPE', 'deviceType=0');
      break;
    default:
      if (message.type !== MessageType.TEXT_HTML) {
        if (message.sourceSubscriberId === client.currentSubscriber.id && !client.options.messageHandling.processOwnMessages) {
          return Promise.resolve();
        }
      }
      break;
  }
  // Internal
  client.emit('message', message);
  return await client.emit(message.isGroup ? Event.GROUP_MESSAGE : Event.PRIVATE_MESSAGE, message);
};
