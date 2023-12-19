import Base from '../Base.js';
import validator from '../../validator/index.js';
import { BlacklistLink, LinkMetadata, MessageSettings, WOLFAPIError } from '../../models/index.js';
import { Command, MessageFilterTier } from '../../constants/index.js';

class Misc extends Base {
  constructor (client) {
    super(client);

    this.blacklist = [];
    this.metadataResults = [];
  }

  /**
   * Get metadata for a url
   * @param {String} url
   * @returns {Promise<Response<LinkMetadata>>}
   */
  async metadata (url) {
    if (validator.isNullOrUndefined(url)) {
      throw new WOLFAPIError('url cannot be null or empty', { url });
    } else if (typeof url !== 'string') {
      throw new WOLFAPIError('url must be type string', { url });
    }

    if (this.metadataResults.some((result) => this.client.utility.string.isEqual(result.url, url))) {
      return this.metadataResults.find((result) => this.client.utility.string.isEqual(result.url, url)).metadata;
    }

    const response = await this.client.websocket.emit(
      Command.METADATA_URL,
      {
        headers: {
          version: 2
        },
        body: {
          url
        }
      }
    );

    if (response.success) {
      const metadata = new LinkMetadata(this.client, response.body);

      this.metadataResults.push(
        {
          url,
          metadata
        }
      );

      response.body = metadata;
    }

    return response;
  }

  /**
   * Get list of blacklisted links
   * @param {Boolean} forceNew
   * @returns {Promise<Array<BlacklistLink>>}
   */
  async linkBlacklist (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.blacklist.length) {
      return this.blacklist;
    }

    const result = await this.client.websocket.emit(Command.METADATA_URL_BLACKLIST);

    this._blacklist = result.body?.map((item) => new BlacklistLink(this.client, item)) ?? [];

    return this._blacklist;
  }

  /**
   * Get the AWS security token
   * @param {Boolean} forceNew
   * @returns {Promise<*>}
   */
  async getSecurityToken (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.client.cognito) {
      return this.client.cognito;
    }

    const response = await this.client.websocket.emit(Command.SECURITY_TOKEN_REFRESH);

    if (response.success) {
      this.client.cognito = response.body;
    } else {
      throw new WOLFAPIError(response.headers.message || 'Error occurred while requesting new security token');
    }

    return this.client.cognito;
  }

  /**
   * Get Bot message settings
   * @returns {Promise<Response<MessageSettings>>}
   */
  async getMessageSettings () {
    const response = await this.client.websocket.emit(Command.MESSAGE_SETTING);

    return response.success ? new MessageSettings(this.client, response.body) : null;
  }

  /**
   * Set the Bot message settings
   * @param {MessageFilterTier} messageFilterTier
   * @returns {Promise<Response>}
   */
  async updateMessageSettings (messageFilterTier) {
    if (!validator.isValidNumber(messageFilterTier)) {
      throw new WOLFAPIError('messageFilterTier must be a valid number', { messageFilterTier });
    } else if (!Object.values(MessageFilterTier).includes(parseInt(messageFilterTier))) {
      throw new WOLFAPIError('messageFilterTier is not valid', { messageFilterTier });
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_SETTING_UPDATE,
      {
        spamFilter: {
          enabled: messageFilterTier !== MessageFilterTier.OFF,
          tier: messageFilterTier
        }
      }
    );
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return false; }

    this._blacklist = [];
    this.metadataResults = [];
  }
}

export default Misc;
