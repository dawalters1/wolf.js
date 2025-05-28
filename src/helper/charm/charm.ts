/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { CharmOptions, CharmUserSummaryOptions, CharmUserStatisticsOptions } from '../../options/requestOptions.ts';
import { Charm } from '../../structures/charm.ts';
import CharmSummary from '../../structures/charmSummary.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

class CharmHelper extends Base<CacheManager<Charm, Map<number, Charm>>> {
  constructor (client: WOLF) {
    super(client, new CacheManager(new Map()));
  }

  async getById (charmId: number, languageId: Language, opts?: CharmOptions): Promise<Charm | null> {
    return (await this.getByIds([charmId], languageId, opts))[0];
  }

  async getByIds (charmIds: number[], languageId: Language, opts?: CharmOptions): Promise<(Charm | null)[]> {
    const charmsMap = new Map<number, Charm | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedAchievements = this.cache!.mget(charmIds)
        .filter((charm): charm is Charm => charm !== null && charm.hasLanguage(languageId));

      cachedAchievements.forEach((achievement) => charmsMap.set(achievement.id, achievement));
    }

    const missingIds = charmIds.filter((id) => !charmsMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Array<WOLFResponse<Charm>>>(
        Command.CHARM_LIST,
        {
          body: {
            idList: missingIds,
            languageId
          }
        });

      response.body.filter((charmResponse) => charmResponse.success)
        .forEach((charmResponse) => charmsMap.set(charmResponse.body.id, this.cache!.set(charmResponse.body)));
    }

    return charmIds.map((achievementId) => charmsMap.get(achievementId) ?? null);
  }

  async getUserSummary (userId: number, opts?: CharmUserSummaryOptions): Promise<CharmSummary[]> {
    const user = await this.client.user.getById(userId);

    if (user === null) {
      throw new Error('');
    }

    if (!opts?.forceNew && user.charmSummary!.fetched) {
      return user.charmSummary!.values();
    }

    const response = await this.client.websocket.emit<CharmSummary[]>(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId
        }
      });

    user.charmSummary.fetched = true;

    return user.charmSummary!.mset(response.body);
  }

  async getUserStatistics (userId: number, opts?: CharmUserStatisticsOptions): Promise<CharmSummary[]> {
    const user = await this.client.user.getById(userId);

    if (user === null) {
      throw new Error('');
    }

    if (!opts?.forceNew && user.charmStatistics!.fetched) {
      return user.charmStatistics;
    }

    const response = await this.client.websocket.emit<CharmSummary[]>(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId
        }
      });

    user.charmStatistics._patch(response.body);

    return user.charmStatistics;
  }
}

export default CharmHelper;
