import BaseHelper from '../baseHelper.js';
import Charm from '../../entities/charm.js';
import CharmStatistic from '../../entities/charmStatistic.js';
import CharmSummary from '../../entities/charmSummary.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validator/index.js';

class CharmHelper extends BaseHelper {
  async getById (charmId, languageId, opts) {
    charmId = Number(charmId) || charmId;
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(charmId)
        .isNotNullOrUndefined(`CharmHelper.getById() parameter, charmId: ${charmId} is null or undefined`)
        .isValidNumber(`CharmHelper.getById() parameter, charmId: ${charmId} is not a valid number`)
        .isGreaterThan(0, `CharmHelper.getById() parameter, charmId: ${charmId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`CharmHelper.getById() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `CharmHelper.getById() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'CharmHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([charmId], languageId, opts))[0];
  }

  async getByIds (charmIds, languageId, opts) {
    charmIds = charmIds.map((channelId) => Number(channelId) || channelId);

    { // eslint-disable-line no-lone-blocks
      validate(charmIds)
        .isArray(`CharmHelper.getByIds() parameter, charmIds: ${charmIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('CharmHelper.getByIds() parameter, charmId[{index}]: {value} is null or undefined')
        .isValidNumber('CharmHelper.getByIds() parameter, charmId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'CharmHelper.getByIds() parameter, charmId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`CharmHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `CharmHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'CharmHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? charmIds
      : charmIds.filter(
        (charmId) => !this.store.has(
          (charm) => charm.id === charmId && charm.languageId === languageId
        )
      );

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

      for (const [index, charmResponse] of response.body.entries()) {
        const charmId = idsToFetch[index];

        if (!charmResponse.success) {
          this.store.delete((charm) => charm.id === charmId && charm.languageId === languageId);
          continue;
        }

        this.store.set(
          new Charm(this.client, charmResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return charmIds.map((charmId) =>
      this.store.get((charm) => charm.id === charmId && charm.languageId === languageId)
    );
  }

  async getUserSummary (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`CharmHelper.getUserSummary() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`CharmHelper.getUserSummary() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `CharmHelper.getUserSummary() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'CharmHelper.getUserSummary() parameter, opts.{parameter}: {value} {error}');
    }

    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user.charmSummaryStore.fetched) {
      return user.charmSummaryStore.values();
    }

    const response = await this.client.websocket.emit(
      Command.CHARM_SUBSCRIBER_SUMMARY_LIST,
      {
        body: {
          id: userId
        }
      }
    );

    user.charmSummaryStore.fetched = true;

    return response.body.map(
      (serverCharmSummary) =>
        user.charmSummaryStore.set(
          new CharmSummary(this.client, serverCharmSummary),
          response.headers?.maxAge
        )
    );
  }

  async getUserStatistics (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`CharmHelper.getUserStatistics() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`CharmHelper.getUserStatistics() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `CharmHelper.getUserStatistics() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'CharmHelper.getUserStatistics() parameter, opts.{parameter}: {value} {error}');
    }
    const user = await this.client.user.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!opts?.forceNew && user.charmStatisticsStore.fetched) {
      return user.charmStatisticsStore.value;
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

    user.charmStatisticsStore.value = user.charmStatisticsStore.value?.patch(response.body) ?? new CharmStatistic(this.client, response.body);

    return user.charmStatisticsStore.value;
  }
}

export default CharmHelper;
