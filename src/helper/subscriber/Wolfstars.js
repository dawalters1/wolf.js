import Command from '../../constants/Command.js';
import _ from 'lodash';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import MapExtended from '../../utils/MapExtended.js';

class Wolfstars extends Base {
  constructor (client) {
    super(client);

    this.talents = new MapExtended();
  }

  async getTalentList (languageId, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(languageId).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    if (!forceNew && this.talents.has(languageId)) {
      return this.talents.get(languageId).values();
    }

    const response = await this.client.websocket.emit(
      Command.WOLFSTAR_TALENT_LIST,
      {
        languageId: parseInt(languageId)
      }
    );

    return response.success
      ? this.talents.set(
        languageId,
        new MapExtended(
          response.body
            .map((data) =>
              [
                data.id,
                new models.WOLFStarTalent(
                  this.client,
                  data
                )
              ]
            )
        )
      )
      : [];
  }

  /**
   * Get a subscriber Wolfstar statistics
   * @param {Number} id
   * @returns {Promise<WolfstarsProfile>}
   */
  async getById (id) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    return (await this.getByIds([id]))[0];
  }

  /**
   * Get a subscribers Wolfstar statistics
   * @param subscriberIds
   * @returns {Promise<WolfstarsProfile | Array<WolfstarsProfile>>}
   */
  async getByIds (subscriberIds) {
    subscriberIds = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!subscriberIds.length) {
        throw new models.WOLFAPIError('subscriberIds cannot be null or empty', { subscriberIds });
      }

      if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
        throw new models.WOLFAPIError('subscriberIds cannot contain duplicates', { subscriberIds });
      }

      for (const subscriberId of subscriberIds) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { id: subscriberId });
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId must be a valid number', { id: subscriberId });
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { id: subscriberId });
        }
      }
    }

    const wolfstars = [];

    const idLists = _.chunk(subscriberIds, this.client._frameworkConfig.get('batching.length'));

    for (const idList of idLists) {
      const response = await this.client.websocket.emit(
        Command.WOLFSTAR_PROFILE,
        {
          headers: {
            version: 2
          },
          body: {
            idList
          }
        }
      );

      if (response.success) {
        wolfstars.push(...Object.values(response.body)
          .map((wolfstarResponse) => new Response(wolfstarResponse))
          .map((wolfstarResponse, index) =>
            wolfstarResponse.success
              ? new models.WolfstarsProfile(this.client, wolfstarResponse.body)
              : new models.WolfstarsProfile(this.client, { subscriberId: idList[index] })
          )
        );
      } else {
        wolfstars.push(...idList.map((subscriberId) => new models.WolfstarsProfile(this.client, { subscriberId })));
      }
    }

    return Array.isArray(subscriberIds) ? wolfstars : wolfstars[0];
  }

  _cleanUp (reconnection) {
    this.talents.clear();
  }
}

export default Wolfstars;
