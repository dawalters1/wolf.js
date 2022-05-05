const { Commands, Capability, Command } = require('../../constants');
const Base = require('../Base');
const Event = require('./Event');

const validator = require('../../validator');
const { result } = require('lodash');
const WOLFAPIError = require('../../models/WOLFAPIError');

const models = require('../../models');

const _ = require('lodash');

const buildGroupFromModule = (groupModule) => {
  const base = groupModule.base;
  base.extended = groupModule.extended;
  base.audioConfig = groupModule.audioConfig;
  base.audioCounts = groupModule.audioCounts;
  base.messageConfig = groupModule.messageConfig;

  return base;
};

class Group extends Base {
  constructor (client) {
    super(client);

    this.event = new Event(this);
  }

  async list () {
    if (!this.cache.fetched) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_GROUP_LIST,
        {
          subscribe: true
        }
      );

      if (response.success) {
        this.cache.fetched = true;

        if (result.body.length > 0) {
          const groups = await this.getByIds(result.body.map((group) => group.id));

          for (const group of groups) {
            group.inGroup = true;
            group.capabilities = result.body.find((grp) => group.id === grp.id).capabilities || Capability.REGULAR;
          }
        }
      }
    }

    return this.cache.list().filter((group) => group.InGroup);
  }

  async getById (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    return (await this.getByIds([id]))[0];
  }

  async getByIds (ids, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new WOLFAPIError('ids cannot be null or empty', ids);
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new WOLFAPIError('ids cannot contain duplicates', ids);
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new WOLFAPIError('id cannot be null or undefined', id);
      } else if (!validator.isValidNumber(id)) {
        throw new WOLFAPIError('id must be a valid number', id);
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', id);
      }
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    const groups = !forceNew ? this.cache.get(ids) : [];

    if (groups.length !== ids.length) {
      const idLists = _.chunk(ids.filter((eventId) => !groups.some((group) => group.id === eventId), this.client.config.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Commands.GROUP_PROFILE,
          {
            headers: {
              version: 4
            },
            body: {
              idList,
              subscribe: true,
              entities: ['base', 'extended', 'audioCounts', 'audioConfig', 'messageConfig']
            }
          }
        );

        if (response.success) {
          const groupResponses = Object.values(response.body).map((eventResponse) => new Response(eventResponse));

          for (const [index, groupResponse] of groupResponses.entries()) {
            groups.push(groupResponse.success ? this.cache.add(new models.Group(this.client, buildGroupFromModule(groupResponse.body))) : new models.Group(this.client, { id: idList[index] }));
          }
        } else {
          groups.push(...idList.map((id) => new models.Group(this.client, { id })));
        }
      }
    }

    return groups;
  }

  async getByName (name) {
    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', name);
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', name);
    }

    const response = await this.client.websocket.emit(
      Commands.GROUP_PROFILE,
      {
        headers: {
          version: 4
        },
        body: {
          name: name.toLowerCase(),
          subscribe: true,
          entities: ['base', 'extended', 'audioCounts', 'audioConfig', 'messageConfig']
        }
      }
    );

    return response.success ? this.cache.add(new models.Group(this.client, buildGroupFromModule(response.body))) : new models.Group(this.client, { name });
  }

  async joinById (id, password = undefined) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        groupId: id,
        password
      }
    );
  }

  async joinByName (name, password = undefined) {
    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', name);
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', name);
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        name: name.toLowerCase(),
        password
      }
    );
  }

  async leaveById (id) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        groupId: id
      }
    );
  }

  async leaveByName (name) {
    if (validator.isNullOrUndefined(name)) {
      throw new WOLFAPIError('name cannot be null or undefined', name);
    } else if (validator.isNullOrWhitespace(name)) {
      throw new WOLFAPIError('name cannot be null or empty', name);
    }

    const group = await this.getByName(name);

    if (!group.exists) {
      throw new WOLFAPIError('Unknown Group', name);
    }

    return await this.leaveById(group.id);
  }

  async getChatHistory (id, chronological, timestamp = 0, limit = 15) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    if (!validator.isValidBoolean(chronological)) {
      throw new WOLFAPIError('chronological must be a valid boolean', chronological);
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', timestamp);
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', timestamp);
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', timestamp);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(limit)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_GROUP_HISTORY_LIST,
      {
        headers: {
          version: 3
        },
        body: {
          id: parseInt(id),
          limit: parseInt(limit),
          chronological,
          timestampEnd: timestamp === 0 ? undefined : parseInt(timestamp)
        }
      }
    );

    return response.success ? response.body.map((message) => new models.Message(this.client, message)) : [];
  }

  // TODO: Large group handling, not V1 (current) handling
  /*
    - Get Subscriber
    - Get Privileged (mod, admin, owner),
    - Get Regular (regular, silenced??),
    - Get Banned
  */

  async getStats (id) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', id);
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', id);
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', id);
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_STATS,
      {
        id: parseInt(id)
      }
    );

    return response.success ? new models.GroupStats(this.client, response.body) : undefined;
  }

  async getRecommendationList () {
    const response = await this.client.websocket.emit(Command.GROUP_RECOMMENDATION_LIST);

    return response.success ? await this.getByIds(response.body.map((idHash) => idHash.id)) : [];
  }
}

module.exports = Group;
