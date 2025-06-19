import Blacklist, { ServerBlacklist } from '../../structures/blacklist';
import { Command } from '../../constants/Command';
import ExpiryMap from 'expiry-map';
import Metadata, { ServerMetadata } from '../../structures/metadata';
import StatusCodes from 'http-status-codes';
import WOLF from '../../client/WOLF';

class MetadataHelper {
  readonly client: WOLF;
  readonly _blacklist: ExpiryMap<number, Blacklist> = new ExpiryMap(180); // This does not align with other helper caching
  readonly _metadata: ExpiryMap<string, Metadata> = new ExpiryMap(60);// This does not align with other helper caching

  constructor (client: WOLF) {
    this.client = client;
  }

  async metadata (url: string): Promise<Metadata | null> {
    const cached = this._metadata.get(url.toLocaleLowerCase());

    if (cached) { return cached; }

    try {
      const response = await this.client.websocket.emit<ServerMetadata>(
        Command.METADATA_URL,
        {
          body: {
            url
          }
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this._metadata.set(
        url.toLocaleLowerCase(),
        new Metadata(
          this.client,
          response.body
        )
      ).get(url.toLocaleLowerCase())!;
    } catch (error) {
      if (error.code === StatusCodes.FORBIDDEN) {
        return null;
      }
      if (error.code === StatusCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async urlBlacklist () {
    if (this._blacklist.size) {
      return [...this._blacklist.values()];
    }

    const response = await this.client.websocket.emit<ServerBlacklist[]>(Command.METADATA_URL_BLACKLIST);

    response?.body.map((serverBlacklist) => this._blacklist.set(serverBlacklist.id, new Blacklist(this.client, serverBlacklist)));

    return [...this._blacklist.values()];
  }
}

export default MetadataHelper;
