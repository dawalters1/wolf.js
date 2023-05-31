import { Capability, Category, Command, Language } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models, { Search } from '../../models/index.js';
import _ from 'lodash';
import Member from './Member.js';
import patch from '../../utils/patch.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { fileTypeFromBuffer } from 'file-type';

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
    this.groups = [];
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

        if (!response.body?.length) {
          return this.groups.filter((group) => group.inGroup);
        }

        const groups = await this.getByIds(response.body.map((group) => group.id), true);

        for (const group of groups) {
          group.inGroup = true;
          group.capabilities = response.body.find((grp) => group.id === grp.id).capabilities || Capability.REGULAR;
        }
      }
    }

    return this.groups.filter((group) => group.inGroup);
  }

  /**
   *
   * @param {*} id
   * @param {*} subscribe
   * @param {*} forceNew
   * @returns {Promise<import('../../models/index.js').Group>} Group
   */
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

    const groups = !forceNew ? this.groups.filter((group) => ids.includes(group.id)) : [];

    if (groups.length !== ids.length) {
      const idLists = _.chunk(ids.filter((groupId) => !groups.some((group) => group.id === groupId)), this.client._frameworkConfig.get('batching.length'));

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

    if (!forceNew && this.groups.some((group) => this.client.utility.string.isEqual(group.name, name))) {
      return this.groups.find((group) => this.client.utility.string.isEqual(group.name, name));
    }

    if (!forceNew && this.groups.some((group) => this.client.utility.string.isEqual(group.name, name))) {
      return this.groups.find((group) => this.client.utility.string.isEqual(group.name, name));
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

  async update (id, { description, peekable, disableHyperlink, disableImage, disableImageFilter, disableVoice, longDescription, discoverable, language, category, advancedAdmin, questionable, locked, closed, entryLevel, avatar }) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (peekable && !validator.isValidBoolean(peekable)) {
      throw new models.WOLFAPIError('peekable must be a valid boolean', { peekable });
    }

    if (disableHyperlink && !validator.isValidBoolean(disableHyperlink)) {
      throw new models.WOLFAPIError('disableHyperlink must be a valid boolean', { disableHyperlink });
    }

    if (disableImage && !validator.isValidBoolean(disableImage)) {
      throw new models.WOLFAPIError('disableImage must be a valid boolean', { disableImage });
    }

    if (disableImageFilter && !validator.isValidBoolean(disableImageFilter)) {
      throw new models.WOLFAPIError('disableImageFilter must be a valid boolean', { disableImageFilter });
    }

    if (disableVoice && !validator.isValidBoolean(disableVoice)) {
      throw new models.WOLFAPIError('disableVoice must be a valid boolean', { disableVoice });
    }

    if (discoverable && !validator.isValidBoolean(discoverable)) {
      throw new models.WOLFAPIError('discoverable must be a valid boolean', { discoverable });
    }

    if (advancedAdmin && !validator.isValidBoolean(advancedAdmin)) {
      throw new models.WOLFAPIError('advancedAdmin must be a valid boolean', { advancedAdmin });
    }

    if (closed && !validator.isValidBoolean(closed)) {
      throw new models.WOLFAPIError('closed must be a valid boolean', { closed });
    }

    if (locked && !validator.isValidBoolean(locked)) {
      throw new models.WOLFAPIError('locked must be a valid boolean', { locked });
    }

    if (questionable && !validator.isValidBoolean(questionable)) {
      throw new models.WOLFAPIError('questionable must be a valid boolean', { questionable });
    }

    if (language) {
      if (!validator.isValidNumber(language)) {
        throw new models.WOLFAPIError('language must be a valid number', { language });
      } else if (!Object.values(Language).includes(parseInt(language))) {
        throw new models.WOLFAPIError('language is not valid', { language });
      }
    }

    if (category) {
      if (!validator.isValidNumber(category)) {
        throw new models.WOLFAPIError('category must be a valid number', { category });
      } else if (!Object.values(Category).includes(parseInt(category))) {
        throw new models.WOLFAPIError('category is not valid', { category });
      }
    }

    const avatarConfig = this.client._frameworkConfig.get('multimedia.avatar.group');

    if (avatar) {
      if (!Buffer.isBuffer(avatar)) {
        throw new models.WOLFAPIError('avatar must be a valid buffer', { avatar });
      }

      validateMultimediaConfig(avatarConfig, avatar);
    }

    const group = await this.getById(parseInt(id));

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { id });
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_PROFILE_UPDATE,
      {
        id: parseInt(id),
        description,
        peekable,
        messageConfig: {
          disableHyperlink,
          disableImage,
          disableImageFilter,
          disableVoice
        },
        extended: {
          longDescription,
          discoverable,
          language: parseInt(language),
          category: parseInt(category),
          advancedAdmin,
          questionable,
          locked,
          closed,
          entryLevel: parseInt(entryLevel)
        }
      }
    );

    if (response.success && avatar) {
      response.body.avatarUpload = await this.client.multimedia.upload(
        avatarConfig,
        {
          data: avatar.toString('base64'),
          mimeType: (await fileTypeFromBuffer(avatar)).mime,
          id: parseInt(id),
          source: this.client.currentSubscriber.id
        }
      );
    }

    return response;
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

  async getChatHistory (id, chronological = false, timestamp = 0, limit = 15) {
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
    } else if (validator.isLessThanZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than 0', { timestamp });
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
          timestampEnd: !timestamp ? undefined : parseInt(timestamp)
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

  async search (query) {
    if (validator.isNullOrUndefined(query)) {
      throw new models.WOLFAPIError('query cannot be null or undefined', { query });
    } else if (validator.isNullOrWhitespace(query)) {
      throw new models.WOLFAPIError('query cannot be null or empty', { query });
    }

    const response = await this.client.websocket.emit(
      Command.SEARCH,
      {
        query,
        types: ['groups']
      }
    );

    return response.body?.map((result) => new Search(this.client, result)) ?? [];
  }

  _process (value) {
    const existing = this.groups.find((group) => group.id === value.id);

    existing ? patch(existing, value) : this.groups.push(value);

    return value;
  }

  _cleanUp (reconnection = false) {
    this.groups = [];
    this.fetched = false;
    this.member._cleanUp(reconnection);
  }
}

export default Group;
