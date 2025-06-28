import Cognito from '../../entities/cognito.js';
import { Command } from '../../constants/Command.js';
import { UserPresence } from '../../constants/index.js';

class SecurityHelper {
  constructor (client) {
    this.client = client;
  }

  /**
   * @param {string} email
   * @param {string} password
   * @param {UserPresence} [state]
   * @returns {Promise<import('../../entities/WOLFResponse.js').default>}
   */
  async login (email, password, state = UserPresence.ONLINE) {
    return await this.client.websocket.emit(
      Command.SECURITY_LOGIN,
      {
        headers: {
          version: 2
        },
        body: {
          type: 'email',
          onlineState: state,
          username: email,
          password
        }
      }
    );
  }

  /**
   * @returns {Promise<WOLFResponse>}
   */
  async logout () {
    if (!this.client.loggedIn) {
      throw new Error('Client is not logged in');
    }

    return this.client.websocket.emit(Command.SECURITY_LOGOUT);
  }

  /**
   * @param {SecurityTokenOptions} [opts]
   * @returns {Promise<Cognito>}
   */
  async getToken (opts) {
    if (!opts?.forceNew && this.cognito) {
      return this.cognito;
    }

    const response = await this.client.websocket.emit(Command.SECURITY_TOKEN_REFRESH);
    this.cognito = new Cognito(this.client, response.body);
    return this.cognito;
  }
}

export default SecurityHelper;
