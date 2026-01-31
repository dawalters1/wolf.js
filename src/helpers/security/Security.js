import BaseHelper from '../BaseHelper.js';
import Cognito from '../../entities/Cognito.js';
import { nanoid } from 'nanoid';
import OnlineState from '../../constants/OnlineState.js';
import { validate } from '../../validation/Validation.js';

export default class SecurityHelper extends BaseHelper {
  #cognito;
  constructor (client) {
    super(client);

    this.#cognito = null;
  }

  // eslint-disable-next-line accessor-pairs
  set cognito (value) {
    this.#cognito = value;
  }

  async logout () {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    return this.client.websocket.emit('security logout');
  }

  async securityToken (opts) {
    validate(opts, this, this.securityToken)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew && this.#cognito) { return this.#cognito; }

    const response = await this.client.websocket.emit('security token refresh');

    this.#cognito = new Cognito(this.client, response.body);

    return this.#cognito;
  }
}
