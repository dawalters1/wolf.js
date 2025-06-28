import BaseHelper from '../baseHelper.js';
import Charm from '../../entities/charm.js';
import CharmStatistic from '../../entities/charmStatistic.js';
import CharmSummary from '../../entities/charmSummary.js';
import { Command } from '../../constants/Command.js';

class CharmHelper extends BaseHelper {
  async getById (charmId, languageId, opts) {
    return (await this.getByIds([charmId], languageId, opts))[0];
  }

  async getByIds (charmIds, languageId, opts) {
    const charmsMap = new Map();

    if (!opts?.forceNew) {
      const cachedCharms = this.cache.getAll(charmIds)
        .filter(charm => charm !== null && charm.hasLanguage(languageId));
      cachedCharms.forEach(charm => charmsMap.set(charm.id, charm));
    }

    const idsToFetch = charmIds.filter(id => !charmsMap.has(id));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        Command.CHARM_LIST,
        {
          body: {
            idList: idsToFetch,
            languageId
          }
        }
      );

      [...response.body.values()].filter(charmResponse => charmResponse.success)
        .forEach(charmResponse => {
          const existing = this.cache.get(charmResponse.body.id);

          charmsMap.set(
            charmResponse.body.id,
            this.cache.set(
              existing
                ? existing.patch(charmResponse.body)
                : new Charm(this.client, charmResponse.body)
            )
          );
        });
    }

    return charmIds.map(id => charmsMap.get(id) ?? null);
  }

  async getUserSummary (userId, opts) {
    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user._charmSummary.fetched) {
      return user._charmSummary.values();
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId
        }
      }
    );

    user._charmSummary.fetched = true;

    return response.body.map(serverCharmSummary => {
      const existing = user._charmSummary.get(serverCharmSummary.charmId);

      return user._charmSummary.set(
        existing
          ? existing.patch(serverCharmSummary)
          : new CharmSummary(this.client, serverCharmSummary)
      );
    });
  }

  async getUserStatistics (userId, opts) {
    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user._charmStatistics.fetched) {
      return user._charmStatistics.value;
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId,
          extended: opts?.extended ?? true
        }
      }
    );

    user._charmStatistics.value = user._charmStatistics.value?.patch(response.body) ?? new CharmStatistic(this.client, response.body);

    return user._charmStatistics.value;
  }
}

export default CharmHelper;
