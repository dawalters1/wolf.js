import Base from '../Base.js';
import validator from '../../validator/index.js';
import { BlackListLink, LinkMetadata, WOLFAPIError } from '../../models/index.js';
import { Command } from '../../constants/index.js';

class Misc extends Base {
  constructor (client) {
    super(client);

    this.blacklist = [];
    this.metadataResults = [];
  }

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

      return metadata;
    }

    return undefined;
  }

  async linkBlacklist (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.blacklist.length) {
      return this.blacklist;
    }

    const result = await this.client.websocket.emit(Command.METADATA_URL_BLACKLIST);

    this._blacklist = result.body?.map((item) => new BlackListLink(this.client, item)) ?? [];

    return this._blacklist;
  }
}

export default Misc;
