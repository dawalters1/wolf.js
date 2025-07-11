import Blacklist from '../../entities/blacklist.js';
import { Command } from '../../constants/Command.js';
import ExpiryMap from 'expiry-map';
import Metadata from '../../entities/metadata.js';
import StatusCodes from 'http-status-codes';
import { validate } from '../../validator/index.js';

class MetadataHelper {
  constructor (client) {
    this.client = client;
    this._blacklist = new ExpiryMap(180);
    this._metadata = new ExpiryMap(60);
  }

  async metadata (url) {
    { // eslint-disable-line no-lone-blocks
      validate(url)
        .isNotNullOrUndefined(`ChannelHelper.leaveByName() parameter, url: ${url} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.leaveByName() parameter, url: ${url} is empty or whitespace`);
    }
    const normalizedUrl = url.toLocaleLowerCase();

    const cached = this._metadata.get(normalizedUrl);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.websocket.emit(
        Command.METADATA_URL,
        {
          body: {
            url
          }
        }
      );

      const metadata = new Metadata(this.client, response.body);
      this._metadata.set(normalizedUrl, metadata);

      return metadata;
    } catch (error) {
      if (
        error.code === StatusCodes.FORBIDDEN ||
        error.code === StatusCodes.NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async urlBlacklist () {
    if (this._blacklist.size) {
      return [...this._blacklist.values()];
    }

    const response = await this.client.websocket.emit(
      Command.METADATA_URL_BLACKLIST
    );

    response.body.forEach((serverBlacklist) => {
      this._blacklist.set(serverBlacklist.id, new Blacklist(this.client, serverBlacklist));
    });

    return [...this._blacklist.values()];
  }
}

export default MetadataHelper;
