import Command from '../../constants/Command.js';
import _ from 'lodash';
import Response from '../../models/Response.js';
import WolfstarsProfile from '../../models/WolfstarsProfile.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';

class Wolfstars extends Base {
  /**
   * Get a subscriber Wolfstar statistics
   * @param {Number} id
   * @returns {Promise<WolfstarsProfile>}
   */
  async getById (id) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', { id });
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

    if (!subscriberIds.length) {
      return [];
    }

    if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
      throw new WOLFAPIError('subscriberIds cannot contain duplicates', { subscriberIds });
    }

    for (const subscriberId of subscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', { id: subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', { id: subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', { id: subscriberId });
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
              ? new WolfstarsProfile(this.client, wolfstarResponse.body)
              : new WolfstarsProfile(this.client, { subscriberId: idList[index] })
          )
        );
      } else {
        wolfstars.push(...idList.map((subscriberId) => new WolfstarsProfile(this.client, { subscriberId })));
      }
    }

    return wolfstars;
  }
}

export default Wolfstars;
