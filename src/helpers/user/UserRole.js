import BaseHelper from '../BaseHelper.js';
import { StatusCodes } from 'http-status-codes';
import UserRole from '../../entities/UserRole.js';
import { validate } from '../../validation/Validation.js';

export default class UserRoleHelper extends BaseHelper {
  constructor (client) {
    super(client, { ttl: 60 });
  }

  async fetch (id, opts) {
    const normalisedId = this.normaliseNumber(id);

    validate(normalisedId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const user = await this.client.user.fetch(normalisedId);

    if (user === null) { throw new Error(`User with ID ${normalisedId} NOT FOUND`); }

    if (!opts?.forceNew && user.roleStore.fetched) { return user.roleStore.values(); }

    try {
      const response = await this.client.websocket.emit(
        'subscriber role summary',
        {
          headers: {
            version: 2
          },
          body: {
            subscriberId: normalisedId
          }
        }
      );

      user.roleStore.clear();

      response.body.map((serverUserRole) => {
        serverUserRole.userId = normalisedId;

        return user.roleStore.set(
          new UserRole(this.client, serverUserRole)
        );
      });
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
      user.roleStore.clear();
    }

    user.roleStore.fetched = true;
    return user.roleStore.values();
  }
}
