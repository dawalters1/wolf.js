import BaseHelper from '../BaseHelper.js';
import { validate } from '../../validation/Validation.js';

export default class BannedHelper extends BaseHelper {
  list () {
    return this.store?.values();
  }

  isBanned (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    validate(normalisedUserIds, this, this.isBanned)
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const hasResults = normalisedUserIds.map((userId) => this.store.has(userId));

    return isArrayResponse
      ? hasResults
      : hasResults[0];
  }

  async ban (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    validate(normalisedUserIds, this, this.ban)
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const setResults = normalisedUserIds.map((userId) => this.store.set(userId));

    return isArrayResponse
      ? setResults
      : setResults[0];
  }

  unban (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    validate(normalisedUserIds, this, this.unban)
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const deletionResults = normalisedUserIds.map((userId) => this.store.delete(userId));

    return isArrayResponse
      ? deletionResults
      : deletionResults[0];
  }

  clear () {
    return this.store.clear();
  }
}
