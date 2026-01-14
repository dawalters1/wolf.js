import BaseHelper from '../BaseHelper.js';
import WOLFStar from '../../entities/WOLFStar.js';

export default class WOLFStarHelper extends BaseHelper {
  async fetch (ids, opts) {
    const isArrayResponse = Array.isArray(ids);

    const normalisedIds = this.normaliseNumbers(ids);

    // TODO: validation

    const users = await this.client.user.fetch(normalisedIds);

    const missingUserIds = normalisedIds.filter(
      (id) => !users.some((user) => user?.id === id)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} Not Found`);
    }

    const idsToFetch = opts?.forceNew
      ? normalisedIds
      : normalisedIds.filter((id) => {
        const user = users.find((user) => user.id === id);
        return !user.wolfstarStore.fetched;
      });

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'wolfstar profile',
        {
          headers: {
            version: 1
          },
          body: {
            idList: idsToFetch
          }
        }
      );

      for (const [id, childResponse] of response.body.entries()) {
        const user = users.find((user) => user.id === id);

        user.wolfstarStore.value = childResponse.success
          ? new WOLFStar(this.client, childResponse.body)
          : null;
      }
    }
    return isArrayResponse
      ? users.map((user) => user.wolfstarStore.value)
      : users[0].wolfstarStore.value;
  }
}
