
module.exports = (api, messageData) => {
  const message = {
    id: messageData.id,
    body: messageData.data.toString().trim(),
    sourceSubscriberId: messageData.originator.id ? messageData.originator.id : messageData.originator,
    targetGroupId: messageData.isGroup ? messageData.recipient.id ? messageData.recipient.id : messageData.recipient : null,
    embeds: messageData.embeds,
    metadata: messageData.metadata,
    isGroup: messageData.isGroup,
    timestamp: messageData.timestamp,
    edited: messageData.edited,
    type: messageData.mimeType
  };

  message.isCommand = api.commandHandler().isCommand(message);

  return message;
};
