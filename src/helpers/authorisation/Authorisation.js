import BaseHelper from '../BaseHelper.js';
import { validate } from '../../validator/index.js';

export default class AuthorisationHelper extends BaseHelper {
  list () {
    return this.store?.values();
  }

  isAuthorised (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    // TODO: validation

    const hasResults = normalisedUserIds.map((userId) => this.store.has(userId));

    return isArrayResponse
      ? hasResults
      : hasResults[0];
  }

  async authorise (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    // TODO: validation

    const setResults = normalisedUserIds.map((userId) => this.store.set(userId));

    return isArrayResponse
      ? setResults
      : setResults[0];
  }

  deauthorise (userIds) {
    const isArrayResponse = Array.isArray(userIds);
    const normalisedUserIds = this.normaliseNumbers(userIds);

    // TODO: validation

    const deletionResults = normalisedUserIds.map((userId) => this.store.delete(userId));

    return isArrayResponse
      ? deletionResults
      : deletionResults[0];
  }

  clear () {
    return this.store.clear();
  }
}
