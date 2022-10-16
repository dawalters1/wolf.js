import { Capability, Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import _ from 'lodash';
import Member from './Member.js';

const buildGroupFromModule = (groupModule) => {
  const base = groupModule.base;

  base.memberCount = base.members;
  Reflect.deleteProperty(base, 'members');
  base.extended = groupModule.extended;
  base.audioConfig = groupModule.audioConfig;
  base.audioCounts = groupModule.audioCounts;
  base.messageConfig = groupModule.messageConfig;

  return base;
};

class Group extends Base {
  constructor (client) {
    super(client);
    this.fetched = false;
    this.member = new Member(this.client);
  }

  async list () {
    if (!this.fetched) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_GROUP_LIST,
        {
          subscribe: true
        }
      );

      if (response.success) {
        this.fetched = true;

        if (response.body.length > 0) {
          const groups = await this.getByIds(response.body.map((group) => group.id), true);

          for (const group of groups) {
            group.inGroup = true;
            group.capabilities = response.body.find((grp) => group.id === grp.id).capabilities || Capability.REGULAR;
          }
        }
      }
    }

    return this.cache.filter((group) => group.InGroup);
  }

  async getById (id, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id], subscribe, forceNew))[0];
  }

  async getByIds (ids, subscribe = true, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const groups = !forceNew ? this.cache.filter((group) => ids.includes(group.id)) : [];

    if (groups.length !== ids.length) {
      const idLists = _.chunk(ids.filter((groupId) => !groups.some((group) => group.id === groupId), this.client._botConfig.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.GROUP_PROFILE,
          {
            headers: {
              version: 4
            },
            body: {
              idList,
              subscribe,
              entities: ['base', 'extended', 'audioCounts', 'audioConfig', 'messageConfig']
            }
          }
        );

        if (response.success) {
          const groupResponses = Object.values(response.body).map((groupResponse) => new models.Response(groupResponse));

          for (const [index, groupResponse] of groupResponses.entries()) {
            groups.push(groupResponse.success ? this._process(new models.Group(this.client, buildGroupFromModule(groupResponse.body))) : new models.Group(this.client, { id: idList[index] }));
          }
        } else {
          groups.push(...idList.map((id) => new models.Group(this.client, { id })));
        }
      }
    }

    return groups;
  }

  async getByName (name, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(name)) {
      throw new models.WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.cache.some((group) => this.client.utility.string.isEqual(group.name, name))) {
      return this.cache.find((group) => this.client.utility.string.isEqual(group.name, name));
    }

    if (!forceNew && this.cache.some((group) => this.client.utility.string.isEqual(group.name, name))) {
      return this.cache.find((group) => this.client.utility.string.isEqual(group.name, name));
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_PROFILE,
      {
        headers: {
          version: 4
        },
        body: {
          name: name.toLowerCase(),
          subscribe,
          entities: ['base', 'extended', 'audioCounts', 'audioConfig', 'messageConfig']
        }
      }
    );

    return response.success ? this._process(new models.Group(this.client, buildGroupFromModule(response.body))) : new models.Group(this.client, { name });
  }

  async joinById (id, password = undefined) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
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
      throw new models.WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
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
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
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
      throw new models.WOLFAPIError('name cannot be null or undefined', { name });
    } else if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    const group = await this.getByName(name);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { name });
    }

    return await this.leaveById(group.id);
  }

  async getChatHistory (id, chronological, timestamp = 0, limit = 15) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(chronological)) {
      throw new models.WOLFAPIError('chronological must be a valid boolean', { chronological });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
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

    return response.body?.map((message) => new models.Message(this.client, message)) ?? [];
  }

  async getStats (id) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
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

  _process (value) {
    const existing = this.cache.find((group) => group.id === value.id);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.cache.push(value);
    }

    return value;
  }
}

export default Group;
