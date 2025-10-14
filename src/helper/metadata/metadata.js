import BaseStore from '../../caching/BaseStore.js';
import Blacklist from '../../entities/blacklist.js';
import { Command } from '../../constants/Command.js';
import Metadata from '../../entities/metadata.js';
import StatusCodes from 'http-status-codes';
import { validate } from '../../validator/index.js';

class MetadataHelper {
  constructor (client) {
    this.client = client;
    this._blacklist = new BaseStore();
    this._metadata = new BaseStore();
  }

  async metadata (url) {
    { // eslint-disable-line no-lone-blocks
      validate(url)
        .isNotNullOrUndefined(`ChannelHelper.leaveByName() parameter, url: ${url} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.leaveByName() parameter, url: ${url} is empty or whitespace`);
    }
    const normalizedUrl = url.toLocaleLowerCase();

    const cached = this._metadata.get((blacklist) => blacklist.url === normalizedUrl);

    if (cached) { return cached; }

    try {
      const response = await this.client.websocket.emit(
        Command.METADATA_URL,
        {
          body: {
            url
          }
        }
      );

      return this._metadata.set(new Metadata(this.client, response.body));
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

  async urlBlacklist (opts) {
    if (!opts?.forceNew && this._blacklist.fetched) {
      return this._blacklist.values();
    }

    const response = await this.client.websocket.emit(
      Command.METADATA_URL_BLACKLIST
    );

    this._blacklist._fetched = true;
    this._blacklist.clear();

    return response.body.map((serverBlacklist) =>
      this._blacklist.set(new Blacklist(this.client, serverBlacklist)
      )
    );
  }
}

export default MetadataHelper;
