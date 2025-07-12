import BaseHelper from '../baseHelper.js';
import { validate } from '../../validator/index.js';

class AuthorisationHelper extends BaseHelper {
  list () {
    return this.cache?.values();
  }

  isAuthorised (userIds) {
    const isArray = Array.isArray(userIds);
    userIds = (isArray
      ? userIds
      : [userIds]).map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isValidArray(`AuthorisationHelper.isAuthorised() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('AuthorisationHelper.isAuthorised() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('AuthorisationHelper.isAuthorised() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThanZero('AuthorisationHelper.isAuthorised() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    const has = (userId) => this.cache.has(userId);
    return isArray
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async authorise (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`AuthorisationHelper.authorise() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`AuthorisationHelper.authorise() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`AuthorisationHelper.authorise() parameter, userId: ${userId} is less than or equal to zero`);
    }

    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(`User with ID ${userId} is not found`); }
    return !!this.cache.set(user);
  }

  async authoriseAll (userIds) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isValidArray(`AuthorisationHelper.authoriseAll() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('AuthorisationHelper.authoriseAll() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('AuthorisationHelper.authoriseAll() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThanZero('AuthorisationHelper.authoriseAll() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    const users = await this.client.user.getByIds(userIds);
    const missingUserIds = userIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    return users.map((user) => !!this.cache.set(user));
  }

  deauthorise (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`AuthorisationHelper.deauthorise() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`AuthorisationHelper.deauthorise() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`AuthorisationHelper.deauthorise() parameter, userId: ${userId} is less than or equal to zero`);
    }

    return this.cache.delete(userId);
  }

  deauthoriseAll (userIds) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isValidArray(`AuthorisationHelper.deauthoriseAll() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('AuthorisationHelper.deauthoriseAll() parameter, userIds[{index}]: {value} is null or undefined')
        .isValidNumber('AuthorisationHelper.deauthoriseAll() parameter, userIds[{index}]: {value} is not a valid number')
        .isGreaterThanZero('AuthorisationHelper.deauthoriseAll() parameter, userIds[{index}]: {value} is less than or equal to zero');
    }

    return userIds.map((userId) => this.cache.delete(userId));
  }

  unauthorise = this.deauthorise;

  clear () {
    return this.cache.clear();
  }
}

export default AuthorisationHelper;
