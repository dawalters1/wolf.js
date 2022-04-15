const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const oldBalance = await api.store().getBalance();

  api.store()._balance = body.balance;

  api.emit(
    Events.STORE_CREDIT_BALANCE_UPDATE,
    oldBalance ?? 0,
    body.balance
  );
};
