import BaseHelper from '../BaseHelper.js';
import Frame from '../../entities/Frame.js';
import FrameStatistic from '../../entities/FrameStatistic.js';
import FrameSummary from '../../entities/FrameSummary.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validation/Validation.js';

export default class FrameHelper extends BaseHelper {
  async fetch (frameIds, languageId, opts) {
    const isArrayResponse = Array.isArray(frameIds);
    const normalisedFrameIds = this.normaliseNumbers(frameIds);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedFrameIds, this, this.fetch)
      .isArray()
      .noDuplicates()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedLanguageId, this, this.fetch)
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
      ? normalisedFrameIds
      : normalisedFrameIds.filter((id) => !this.store.has((item) => item.id === id && item.languageId === normalisedLanguageId));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'frame list',
        {
          headers: {
      ***REMOVED***
          },
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
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.store.set(
          new Frame(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const frames = normalisedFrameIds.map((id) => this.store.get((item) => item.id === id && item.languageId === normalisedLanguageId));

    return isArrayResponse
      ? frames
      : frames[0];
  }

  async delete (frameIds) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    const normalisedFrameIds = this.normaliseNumbers(frameIds);

    validate(normalisedFrameIds, this, this.fetch)
      .isArray()
      .noDuplicates()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return this.client.websocket.emit(
      'frame subscriber delete',
      {
        body: {
          idList: normalisedFrameIds
        }
      }
    );
  }

  async set (frameId) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    const normalisedFrameId = this.normaliseNumber(frameId);

    validate(normalisedFrameId, this, this.set)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return await this.client.websocket.emit(
      'frame subscriber set selected',
      {
        body: {
          frameId: normalisedFrameId
        }
      }
    );
  }

  async clear () {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    return this.client.websocket.emit(
      'frame subscriber delete selected'
    );
  }

  async summary (userId, opts) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.summary)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const user = await this.client.user.fetch(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} NOT FOUND`); }

    if (!opts?.forceNew && user.frameSummaryStore.fetched) { return user.frameSummaryStore.values(); }

    const response = await this.client.websocket.emit(
      'charm subscriber summary list',
      {
        body: {
          id: normalisedUserId
        }
      }
    );

    const maxAge = response.headers?.maxAge;
    user.frameSummaryStore.fetched = true;

    return response.body.map(
      (serverFrameSummary) =>
        user.frameSummaryStore.set(
          new FrameSummary(this.client, serverFrameSummary),
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

    validate(opts, this, this.statistics)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),
          extended: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const user = await this.client.user.fetch(normalisedUserId);

    if (!user) {
      throw new Error(`User with ID ${normalisedUserId} NOT FOUND`);
    }

    if (!opts?.forceNew && user.frameStatisticsStore.fetched) {
      return user.frameStatisticsStore.value;
    }

    const response = await this.client.websocket.emit(
      'frame subscriber statistics',
      {
        body: {
          id: normalisedUserId,
          extended: opts?.extended ?? true
        }
      }
    );

    user.frameStatisticsStore.value = user.frameStatisticsStore.value?.patch(response.body) ?? new FrameStatistic(this.client, response.body);

    return user.frameStatisticsStore.value;
  }
}
