module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const contact = api.contact()._contacts.find((contact) => contact.id === body.targetId);

  if (contact) {
    api.contact()._contacts.splice(api.contact()._contacts.indexOf(contact), 1);
  }

  api.on._emit(command, contact);

  return await api.emit(
    command,
    contact
  );
};
