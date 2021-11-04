module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

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
    command,
    blocked
  );
};
