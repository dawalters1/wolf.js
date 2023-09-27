import { Event } from '../../../../constants/index.js';

/**
 * @param {import('../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const oldBalance = client.store._balance;

  client.store._balance = body.balance;

  return client.emit(
    Event.STORE_CREDIT_BALANCE_UPDATE,
    oldBalance >= 0 ? oldBalance : 0,
    body.balance
  );
};
