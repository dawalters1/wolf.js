import BaseHelper from '../BaseHelper.js';
import Charm from '../../entities/Charm.js';
import CharmActive from '../../entities/CharmActive.js';
import CharmExpired from '../../entities/CharmExpired.js';
import CharmStatistic from '../../entities/CharmStatistic.js';
import CharmSummary from '../../entities/CharmSummary.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validation/Validation.js';

export default class CharmHelper extends BaseHelper {
  async fetch (charmIds, languageId, opts) {
    const isArrayResponse = Array.isArray(charmIds);

    const normalisedCharmIds = this.normaliseNumbers(charmIds);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedCharmIds, this, this.fetch)
      .isArray()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(languageId, this, this.fetch)
      .isNotNullOrUndefined()
      .in(Object.values(Language));

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const idsToFetch = opts?.forceNew
      ? normalisedCharmIds
      : normalisedCharmIds.filter(
        (charmId) =>
          !this.store.has(
            (item) => item.id === charmId && item.languageId === normalisedLanguageId
          )
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        'charm list',
        {
          body: {
            idList: idsToFetch,
            languageId: normalisedLanguageId
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const id = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete(
            (item) => item.id === id && item.languageId === languageId
          );
          continue;
        }

        this.store.set(
          new Charm(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const charms = normalisedCharmIds.map((charmId) =>
      this.store.get(
        (item) => item.id === charmId && item.languageId === normalisedLanguageId
      )
    );

    return isArrayResponse
      ? charms
      : charms[0];
  }

  async summary (userId, opts) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.summary)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const user = await this.client.user.fetch(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} NOT FOUND`); }

    if (!opts?.forceNew && user.charmSummaryStore.fetched) { return user.charmSummaryStore.values(); }

    const response = await this.client.websocket.emit(
      'charm subscriber summary list',
      {
        body: {
          id: normalisedUserId
        }
      }
    );

    const maxAge = response.headers?.maxAge;
    user.charmSummaryStore.fetched = true;

    return response.body.map(
      (serverCharmSummary) =>
        user.charmSummaryStore.set(
          new CharmSummary(this.client, serverCharmSummary),
          maxAge
        )
    );
  }

  async statistics (userId, opts) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.statistics)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const user = await this.client.user.fetch(normalisedUserId);

    if (!user) {
      throw new Error(`User with ID ${normalisedUserId} NOT FOUND`);
    }

    if (!opts?.forceNew && user.charmStatisticsStore.fetched) {
      return user.charmStatisticsStore.value;
    }

    const response = await this.client.websocket.emit(
      'charm subscriber statistics',
      {
        body: {
          id: normalisedUserId,
          extended: opts?.extended ?? true
        }
      }
    );

    user.charmStatisticsStore.value = user.charmStatisticsStore.value?.patch(response.body) ?? new CharmStatistic(this.client, response.body);

    return user.charmStatisticsStore.value;
  }
}
