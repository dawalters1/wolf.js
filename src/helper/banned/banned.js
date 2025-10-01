import AuthorisationStore from '../../stores_old/AuthorisationStore.js';
import BaseHelper from '../baseHelper.js';
import { validate } from '../../validator/index.js';

class BannedHelper extends BaseHelper {
  constructor (client) {
    super(client, AuthorisationStore);
  }

  list () {
    return this.store?.values();
  }

  isBanned (userIds) {
    const isArray = Array.isArray(userIds);
    userIds = (isArray
      ? userIds
      : [userIds]).map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`BannedHelper.isBanned() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('BannedHelper.isBanned() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('BannedHelper.isBanned() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'BannedHelper.isBanned() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    const has = (userId) => this.store.has(userId);
    return isArray
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async ban (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`BannedHelper.ban() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`BannedHelper.ban() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `BannedHelper.ban() parameter, userId: ${userId} is less than or equal to zero`);
    }

    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(`User with ID ${userId} is not found`); }
    return !!this.store.set(user);
  }

  async banAll (userIds) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`BannedHelper.banAll() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('BannedHelper.banAll() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('BannedHelper.banAll() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'BannedHelper.banAll() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    const users = await this.client.user.getByIds(userIds);
    const missingUserIds = userIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    return users.map((user) => !!this.store.set(user));
  }

  unban (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`BannedHelper.unban() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`BannedHelper.unban() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `BannedHelper.unban() parameter, userId: ${userId} is less than or equal to zero`);
    }

    return this.store.delete(userId);
  }

  unbanAll (userIds) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`BannedHelper.unbanAll() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('BannedHelper.unbanAll() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('BannedHelper.unbanAll() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'BannedHelper.unbanAll() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    return userIds.map((userId) => this.store.delete(userId));
  }

  clear () {
    return this.store.clear();
  }
}

export default BannedHelper;
