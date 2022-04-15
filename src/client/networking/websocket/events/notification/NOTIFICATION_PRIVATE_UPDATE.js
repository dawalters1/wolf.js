const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const cached = await api.notication().list(api.notication()._language);

  const newData = await api.notication().list(api.notication()._language, true);

  for (const notification of newData) {
    if (!cached.find((notif) => notif.id === notification.id)) {
      this._api.emit(Events.NOTIFICATION_RECEIVED, notification);
    }
  }
};
