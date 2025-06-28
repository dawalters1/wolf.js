import Blacklist from '../../entities/blacklist.js';
import { Command } from '../../constants/Command.js';
import ExpiryMap from 'expiry-map';
import Metadata from '../../entities/metadata.js';
import StatusCodes from 'http-status-codes';

class MetadataHelper {
  constructor (client) {
    this.client = client;
    this._blacklist = new ExpiryMap(180);
    this._metadata = new ExpiryMap(60);
  }

  // Helper to clean expired entries before returning values
  _cleanCache (expiryMap) {
    // ExpiryMap removes expired entries automatically on access, but
    // if you want to explicitly clean or filter invalid, do it here
    // For example, remove any entries with null/undefined values
    for (const [key, value] of expiryMap.entries()) {
      if (!value) {
        expiryMap.delete(key);
      }
    }
  }

  async metadata (url) {
    const normalizedUrl = url.toLocaleLowerCase();

    this._cleanCache(this._metadata);

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
    this._cleanCache(this._blacklist);

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
