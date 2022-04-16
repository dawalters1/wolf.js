const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const cached = await api._notication.list(api._notication._language);

  const newData = await api._notication.list(api._notication._language, true);

  for (const notification of newData) {
    if (!cached.find((notif) => notif.id === notification.id)) {
      this._api.emit(Events.NOTIFICATION_RECEIVED, notification);
    }
  }
};
