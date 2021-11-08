module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

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
  api.on._emit(command, contact);

  return await api.emit(
    command,
    contact
  );
};
