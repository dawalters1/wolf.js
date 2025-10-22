import BaseHelper from '../baseHelper.js';
import BaseStore from '../../caching/BaseStore.js';
import Blacklist from '../../entities/blacklist.js';
import { Command } from '../../constants/Command.js';
import Metadata from '../../entities/metadata.js';
import StatusCodes from 'http-status-codes';
import { validate } from '../../validator/index.js';

class MetadataHelper extends BaseHelper {
  #blacklistStore;
  #metadataStore;
  constructor (client) {
    super(client);
    this.#blacklistStore = new BaseStore();
    this.#metadataStore = new BaseStore();
  }

  async metadata (url) {
    { // eslint-disable-line no-lone-blocks
      validate(url)
        .isNotNullOrUndefined(`ChannelHelper.leaveByName() parameter, url: ${url} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.leaveByName() parameter, url: ${url} is empty or whitespace`);
    }
    const normalizedUrl = url.toLocaleLowerCase();

    const cached = this.#metadataStore.get((blacklist) => blacklist.url === normalizedUrl);

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

      return this.#metadataStore.set(new Metadata(this.client, response.body));
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
    if (!opts?.forceNew && this.#blacklistStore.fetched) {
      return this.#blacklistStore.values();
    }

    const response = await this.client.websocket.emit(
      Command.METADATA_URL_BLACKLIST
    );

    this.#blacklistStore.fetched = true;
    this.#blacklistStore.clear();

    return response.body.map((serverBlacklist) =>
      this.#blacklistStore.set(new Blacklist(this.client, serverBlacklist)
      )
    );
  }
}

export default MetadataHelper;
