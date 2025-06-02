import BaseHelper from '../baseHelper.ts';
import { Charm } from '../../structures/charm.ts';
import {
  CharmOptions,
  CharmUserStatisticsOptions,
  CharmUserSummaryOptions
} from '../../options/requestOptions.ts';
import CharmStatistic from '../../structures/charmStatistic.ts';
import CharmSummary from '../../structures/charmSummary.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class CharmHelper extends BaseHelper<Charm> {
  async getById (charmId: number, languageId: Language, opts?: CharmOptions): Promise<Charm | null> {
    return (await this.getByIds([charmId], languageId, opts))[0];
  }

  async getByIds (charmIds: number[], languageId: Language, opts?: CharmOptions): Promise<(Charm | null)[]> {
    const charmsMap = new Map<number, Charm | null>();

    if (!opts?.forceNew) {
      const cachedCharms = this.cache.getAll(charmIds)
        .filter((charm): charm is Charm => charm !== null && charm.hasLanguage(languageId));
      cachedCharms.forEach((charm) => charmsMap.set(charm.id, charm));
    }

    const missingIds = charmIds.filter(id => !charmsMap.has(id));

    if (missingIds.length > 0) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<Charm>>>(
        Command.CHARM_LIST,
        {
          body: {
            idList: missingIds,
            languageId
          }
        }
      );

      response.body.values().filter((charmResponse) => charmResponse.success)
        .forEach((charmResponse) => charmsMap.set(charmResponse.body.id, this.cache.set(charmResponse.body)));
    }

    return charmIds.map(id => charmsMap.get(id) ?? null);
  }

  async getUserSummary (userId: number, opts?: CharmUserSummaryOptions): Promise<CharmSummary[]> {
    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user.charmSummary.fetched) {
      return user.charmSummary.values();
    }

    const response = await this.client.websocket.emit<CharmSummary[]>(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body:
          {
            id: userId
          }
      }
    );

    user.charmSummary.fetched = true;

    return user.charmSummary.setAll(response.body);
  }

  async getUserStatistics (userId: number, opts?: CharmUserStatisticsOptions): Promise<CharmStatistic> {
    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user.charmStatistics.fetched) {
      return user.charmStatistics;
    }

    const response = await this.client.websocket.emit<CharmStatistic>(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId,
          extended: opts?.extended ?? true
        }
      }
    );

    user.charmSummary.fetched = true;
    user.charmStatistics = response.body;

    return user.charmStatistics;
  }
}

export default CharmHelper;
