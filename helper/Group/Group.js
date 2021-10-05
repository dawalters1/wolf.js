const Helper = require('../Helper');
const validator = require('../../utils/validator');

const Response = require('../../networking/Response');
const GroupProfileBuilder = require('../../utils/ProfileBuilders/GroupProfileBuilder');

const request = require('../../constants/request');
const constants = require('@dawalters1/constants');
const fileType = require('file-type');

const toLanguageKey = require('../../utils/toLanguageKey');

module.exports = class Group extends Helper {
  constructor (api) {
    super(api);
    this._groups = [];
    this._joinedGroupsRequested = false;
  }

  /**
   * Get a list of all the bots joined groups
   */
  list () {
    return this._groups.filter((group) => group.inGroup || (group.subscribers && group.subscribers.length > 0));
  }

  /**
   * Create a group
   * @returns {GroupProfileBuilder} Group Profile Builder
   */
  create () {
    return new GroupProfileBuilder(this._api)._create();
  }

  /**
   * Get a list of groups by IDs
   * @param {Number} targettargetGroupIds - The ids of the groups
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByIds (targetGroupIds, requestNew = false) {
    targetGroupIds = [...new Set(Array.isArray(targetGroupIds) ? targetGroupIds : [targetGroupIds])];

    for (const targetGroupId of targetGroupIds) {
      if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
    }

    const groups = !requestNew ? this._groups.filter((group) => targetGroupIds.includes(group.id)) : [];

    for (const batchTargetGroupIdList of this._api.utility().batchArray(targetGroupIds.filter((targetGroupId) => !groups.some((group) => group.id === targetGroupId)), 50)) {
      const result = await this._websocket.emit(request.GROUP_PROFILE, {
        headers: {
          version: 4
        },
        body: {
          idList: batchTargetGroupIdList,
          subscribe: true,
          entities: ['base', 'extended', 'audioCounts', 'audioConfig']
        }
      });
      if (result.success) {
        for (const group of Object.keys(result.body).map((targetGroupId) => {
          const value = new Response(result.body[targetGroupId.toString()]);
          if (value.success) {
            const body = value.body;
            const base = body.base;
            base.extended = body.extended;
            base.language = toLanguageKey(base.extended.language);
            base.audioConfig = body.audioConfig;
            base.audioCounts = body.audioCounts;
            base.exists = true;

            return base;
          } else {
            return {
              id: targetGroupId,
              exists: false
            };
          }
        })) {
          groups.push(this._process(group));
        }
      } else { groups.push(batchTargetGroupIdList.map((id) => ({ id: id, exists: false }))); }
    }

    return groups;
  }

  /**
   * Get a group by ID
   * @param {Number} targetGroupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getById (targetGroupId, requestNew = false) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    return (await this.getByIds([targetGroupId], requestNew))[0];
  }

  /**
   * Get a group by name
   * @param {String} name - The name of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByName (name, requestNew = false) {
    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    if (!requestNew) {
      const group = this._groups.find((grp) => grp.name.toLowerCase() === name.toLowerCase().trim());

      if (group) {
        return group;
      }
    }

    const result = await this._websocket.emit(request.GROUP_PROFILE, {
      headers: {
        version: 4
      },
      body: {
        name: name.toLowerCase(),
        subscribe: true,
        entities: ['base', 'extended', 'audioCounts', 'audioConfig']
      }
    });

    if (result.success) {
      const body = result.body;
      const group = body.base;
      group.extended = body.extended;
      group.audioCounts = body.audioCounts;
      group.audioConfig = body.audioConfig;
      group.exists = true;

      return this._process(group);
    }

    return {
      id: 0,
      name: name,
      exists: false
    };
  }

  /**
   * Join a group by id
   * @param {Number} targetGroupId - The id of the group
   * @param {String} password - Request new data from the server (Optional)
   */
  async joinById (targetGroupId, password = undefined) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.GROUP_MEMBER_ADD, {
      groupId: targetGroupId,
      password
    });
  }

  /**
   * Join a group by name
   * @param {String} name - The name of the group
   * @param {String} password - Request new data from the server (Optional)
   */
  async joinByName (targetGroupName, password = undefined) {
    if (validator.isNullOrWhitespace(targetGroupName)) {
      throw new Error('targetGroupName cannot be null or empty');
    }
    return await this._websocket.emit(request.GROUP_MEMBER_ADD, {
      name: targetGroupName.toLowerCase(),
      password
    });
  }

  /**
   * Leave a group by ID
   * @param {Number} targetGroupId - The Id of the group
   */
  async leaveById (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }
    return await this._websocket.emit(request.GROUP_MEMBER_DELETE, {
      groupId: targetGroupId
    });
  }

  /**
   * Leave a group by name
   * @param {String} name - The name of the group
   */
  async leaveByName (name) {
    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }
    return await this.leaveById((await this.getByName(name)).id);
  }

  /**
   * Get chat history for a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} timestamp - The last timestamp in the group (0 for last messages sent)
   * @param {Number} limit - How many messages the request should return (Min 5, Max 100)
   */
  async getHistory (targetGroupId, timestamp = 0, limit = 10) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(timestamp)) {
      throw new Error('timestamp must be a valid number');
    } else if (validator.isLessThanZero(timestamp)) {
      throw new Error('timestamp cannot be less than 0');
    }

    if (!validator.isValidNumber(limit)) {
      throw new Error('limit must be a valid number');
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new Error('limit cannot be less than or equal to 0');
    }

    if (limit < 5) {
      throw new Error('limit cannot be less than 5');
    } else if (limit > 100) {
      throw new Error('limit cannot be larger than 100');
    }

    const result = await this._websocket.emit(request.MESSAGE_GROUP_HISTORY_LIST,
      {
        headers: {
          version: 3
        },
        body: {
          id: targetGroupId,
          limit,
          chronological: false,
          timestampBegin: timestamp === 0,
          timestampEnd: timestamp === 0 ? undefined : timestamp
        }
      });

    return {
      code: result.code,
      body: result.success
        ? result.body.map((message) => ({
          id: message.id,
          body: message.data.toString(),
          sourceSubscriberId: message.originator.id,
          targetGroupId: message.isGroup ? message.recipient.id : null,
          embeds: message.embeds,
          metadata: message.metadata,
          isGroup: message.isGroup,
          timestamp: message.timestamp,
          edited: message.edited,
          type: message.mimeType
        }))
        : []
    };
  }

  /**
   * Get the members list for a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getSubscriberList (targetGroupId, requestNew = false) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const group = await this.getById(targetGroupId);

    if (!requestNew && group.subscribers && group.subscribers.length >= group.members) {
      return group.subscribers;
    }

    const result = await this._websocket.emit(request.GROUP_MEMBER_LIST, {
      headers: {
        version: 3
      },
      body: {
        id: targetGroupId,
        subscribe: true
      }
    });

    if (result.success) {
      group.inGroup = true;
      group.subscribers = result.body;
    }

    this._process(group);

    return group.subscribers || [];
  }

  /**
   * Get the conversation stats for a group
   * @param {Number} targetGroupId - The id of the gorup
   */
  async getStats (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }
    return await this._websocket.emit(request.GROUP_STATS, {
      id: targetGroupId
    });
  }

  /**
   * Update a groups avatar
   * @param {Number} targetGroupId - The id of the group
   * @param {Buffer} avatar - The new avatar
   */
  async updateAvatar (targetGroupId, avatar) {
    return await this._api._mediaService().uploadGroupAvatar(targetGroupId, avatar, (await fileType.fromBuffer(avatar)).mime);
  }

  /**
   * Update a group subscribers role - Use @dawalters1/constants for capability
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} subscriberId - The id of the subscriber to update
   * @param {Number} capability - The new role for the subscriber
   * @deprecated Will be removed in 1.0.0 use updateSubscriber(targetGroupId, subscriberId, capability) instead
   */
  async updateGroupSubscriber (targetGroupId, subscriberId, capability) {
    console.warn('updateGroupSubscriber(targetGroupId, subscriberId, capability) is deprecated and will be removed in 1.0.0 use updateSubscriber(targetGroupId, subscriberId, capability) instead');
    return await this.updateSubscriber(targetGroupId, subscriberId, capability);
  }

  /**
   * Update a group subscribers role - Use @dawalters1/constants for capability
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} subscriberId - The id of the subscriber to update
   * @param {Number} capability - The new role for the subscriber
   */
  async updateSubscriber (targetGroupId, subscriberId, capability) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(capability)) {
      throw new Error('capability must be a valid number');
    } else if (!Object.values(constants.adminAction).includes(capability)) {
      throw new Error('capability is not valid');
    }

    return await this._websocket.emit(request.GROUP_MEMBER_UPDATE, {
      groupId: targetGroupId,
      id: subscriberId,
      capabilities: capability
    });
  }

  /**
   * Update a group
   * @returns {GroupProfileBuilder} Group Profile Builder
   */
  async update (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const group = await this.getById(targetGroupId);

    if (group.exists) {
      return new GroupProfileBuilder(this._api)._update(group);
    } else {
      throw new Error('group does not exist');
    }
  }

  async _getJoinedGroups () {
    if (this._joinedGroupsRequested) {
      return this._groups.filter((group) => group.inGroup);
    }

    const result = await this._websocket.emit(request.SUBSCRIBER_GROUP_LIST, {
      subscribe: true
    });

    if (result.success) {
      this._joinedGroupsRequested = true;
      const groups = await this.getByIds(result.body.map((group) => group.id));

      for (const group of groups) {
        group.inGroup = true;
        group.myCapabilities = result.body.find((grp) => group.id === grp.id).capabilities || constants.capability.REGULAR;
      }

      return groups;
    }
    return [];
  }

  _process (group) {
    if (group.exists) {
      const existing = this._groups.find((grp) => grp.id === group.id);

      if (existing) {
        for (const key in group) {
          existing[key] = group[key];
        }
      } else {
        this._groups.push(group);
      }
    }
    return group;
  }

  _clearCache () {
    this._groups = [];
    this._joinedGroupsRequested = false;
  }
};
