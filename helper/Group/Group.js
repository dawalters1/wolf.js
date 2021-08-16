const Helper = require('../Helper');
const Response = require('../../networking/Response');
const GroupProfileBuilder = require('../../utils/ProfileBuilders/GroupProfileBuilder');
const validator = require('@dawalters1/validator');
const request = require('../../constants/request');
const constants = require('@dawalters1/constants');
const uploadToMediaService = require('../../utils/uploadToMediaService');
const routes = require('../../MultiMediaService/routes');

module.exports = class Group extends Helper {
  constructor (api) {
    super(api);
    this._groups = [];
    this._joinedGroupsRequested = false;
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
   * @param {Number} groupIds - The ids of the groups
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByIds (groupIds, requestNew = false) {
    try {
      if (!validator.isValidArray(groupIds)) {
        throw new Error('groupIds must be a valid array');
      } else {
        for (const groupId of groupIds) {
          if (!validator.isValidNumber(groupId)) {
            throw new Error('groupId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(groupId)) {
            throw new Error('groupId cannot be less than or equal to 0');
          }
        }
      }

      groupIds = [...new Set(groupIds)];

      const groups = [];

      if (!requestNew) {
        const cached = this._groups.filter((group) => groupIds.includes(group.id));
        if (cached.length > 0) {
          groups.push(...cached);
        }
      }

      if (groups.length !== groupIds.length) {
        for (const batchGroupIdList of this._api.utility().batchArray(groupIds.filter((groupId) => !groups.some((group) => group.id === groupId)), 50)) {
          const result = await this._websocket.emit(request.GROUP_PROFILE, {
            headers: {
              version: 4
            },
            body: {
              idList: batchGroupIdList,
              subscribe: true,
              entities: ['base', 'extended', 'audioCounts', 'audioConfig']
            }
          });
          if (result.success) {
            for (const group of Object.keys(result.body).map((groupId) => {
              const value = new Response(result.body[groupId.toString()]);
              if (value.success) {
                const body = value.body;
                const base = body.base;
                base.audioConfig = body.audioConfig;
                base.audioCounts = body.audioCounts;
                base.extended = body.extended;
                base.exists = true;

                return base;
              } else {
                return {
                  id: groupId,
                  exists: false
                };
              }
            })) {
              groups.push(this._process(group));
            }
          } else { groups.push(batchGroupIdList.map((id) => ({ id: id, exists: false }))); }
        }
      }

      return groups;
    } catch (error) {
      error.method = `Helper/Group/getByIds(groupIds = ${JSON.stringify(groupIds)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get a group by ID
   * @param {Number} groupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getById (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      return (await this.getByIds([groupId], requestNew))[0];
    } catch (error) {
      error.method = `Helper/Group/getById(groupId = ${JSON.stringify(groupId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get a group by name
   * @param {String} name - The name of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByName (name, requestNew = false) {
    try {
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
          name: name,
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
    } catch (error) {
      error.method = `Helper/Group/getByName(name = ${JSON.stringify(name)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Join a group by id
   * @param {Number} groupId - The id of the group
   * @param {String} password - Request new data from the server (Optional)
   */
  async joinById (groupId, password = undefined) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.GROUP_MEMBER_ADD, {
        groupId,
        password
      });
    } catch (error) {
      error.method = `Helper/Group/joinById(groupId = ${JSON.stringify(groupId)}, password = ${JSON.stringify(password)})`;
      throw error;
    }
  }

  /**
   * Join a group by name
   * @param {String} name - The name of the group
   * @param {String} password - Request new data from the server (Optional)
   */
  async joinByName (targetGroupName, password = undefined) {
    try {
      if (validator.isNullOrWhitespace(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or empty');
      }
      return await this._websocket.emit(request.GROUP_MEMBER_ADD, {
        name: targetGroupName.toLowerCase(),
        password
      });
    } catch (error) {
      error.method = `Helper/Group/joinByName(targetGroupName = ${JSON.stringify(targetGroupName)}, password = ${JSON.stringify(password)})`;
      throw error;
    }
  }

  /**
   * Leave a group by ID
   * @param {Number} groupId - The Id of the group
   */
  async leaveById (groupId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      return await this._websocket.emit(request.GROUP_MEMBER_DELETE, {
        groupId: groupId
      });
    } catch (error) {
      error.method = `Helper/Group/leaveById(groupId = ${JSON.stringify(groupId)})`;
      throw error;
    }
  }

  /**
   * Leave a group by name
   * @param {String} name - The name of the group
   */
  async leaveByName (name) {
    try {
      if (validator.isNullOrWhitespace(name)) {
        throw new Error('name cannot be null or empty');
      }
      return await this.leaveById((await this.getByName(name)).id);
    } catch (error) {
      error.method = `Helper/Group/leaveByName(name = ${JSON.stringify(name)})`;
      throw error;
    }
  }

  /**
   * Get chat history for a group
   * @param {Number} groupId - The id of the group
   * @param {Number} timestamp - The last timestamp in the group (0 for last messages sent)
   */
  async getHistory (groupId, timestamp = 0) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanZero(timestamp)) {
        throw new Error('timestamp cannot be less than 0');
      }

      const result = await this._websocket.emit(request.MESSAGE_GROUP_HISTORY_LIST,
        {
          headers: {
            version: 3
          },
          body: {
            id: groupId,
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
            groupId: message.isGroup ? message.recipient.id : null,
            embeds: message.embeds,
            metadata: message.metadata,
            isGroup: message.isGroup,
            timestamp: message.timestamp,
            edited: message.edited,
            type: message.mimeType
          }))
          : []
      };
    } catch (error) {
      error.method = `Helper/Group/getHistory(groupId = ${JSON.stringify(groupId)}, timestamp = ${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  /**
   * Get the members list for a group
   * @param {Number} groupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getSubscriberList (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      const group = await this.getById(groupId);

      if (!requestNew && group.subscribers && group.subscribers.length >= group.members) {
        return group.subscribers;
      }

      const result = await this._websocket.emit(request.GROUP_MEMBER_LIST, {
        headers: {
          version: 3
        },
        body: {
          id: groupId,
          subscribe: true
        }
      });

      if (result.success) {
        group.inGroup = true;
        group.subscribers = result.body;
      }

      this._process(group);

      return group.subscribers || [];
    } catch (error) {
      error.method = `Helper/Group/getSubscriberList(groupId = ${JSON.stringify(groupId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get the conversation stats for a group
   * @param {Number} groupId - The id of the gorup
   */
  async getStats (groupId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      return await this._websocket.emit(request.GROUP_STATS, {
        id: groupId
      });
    } catch (error) {
      error.method = `Helper/Group/getStats(groupId = ${JSON.stringify(groupId)})`;
      throw error;
    }
  }

  /**
   * Update a groups avatar
   * @param {Number} groupId - The id of the group
   * @param {Buffer} avatar - The new avatar
   */
  async updateAvatar (groupId, avatar) {
    try {
      return await uploadToMediaService(this._api, routes.GROUP_AVATAR_UPLOAD, avatar, groupId);
    } catch (error) {
      error.method = `Helper/Group/updateAvatar(groupId = ${JSON.stringify(groupId)}, avatar = ${JSON.stringify('Too big, not displaying this')})`;
      throw error;
    }
  }

  /**
   * Update a group subscribers role - Use @dawalters1/constants for capability
   * @param {Number} groupId - The id of the group
   * @param {Number} subscriberId - The id of the subscriber to update
   * @param {Number} capability - The new role for the subscriber
   */
  async updateGroupSubscriber (groupId, subscriberId, capability) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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
        groupId,
        id: subscriberId,
        capabilities: capability
      });
    } catch (error) {
      error.method = `Helper/Group/updateGroupSubscriber(groupId = ${JSON.stringify(groupId)}, subscriberId = ${JSON.stringify(subscriberId)}, capability = ${JSON.stringify(capability)})`;
      throw error;
    }
  }

  /**
   * Update a group
   * @returns {GroupProfileBuilder} Group Profile Builder
   */
  async update (groupId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      const group = await this.getById(groupId);

      if (group.exists) {
        return new GroupProfileBuilder(this._api)._update(group);
      } else {
        throw new Error('group does not exist');
      }
    } catch (error) {
      error.method = `Helper/Group/update(groupId = ${JSON.stringify(groupId)})`;
      throw error;
    }
  }

  async _getJoinedGroups () {
    try {
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
          group.myCapabilities = result.body.find((grp) => group.id === grp.id).capabilities;
        }

        return groups;
      }
      return [];
    } catch (error) {
      error.method = 'Helper/Group/_getJoinedGroups()';
      throw error;
    }
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

    if (group.audioConfig && !group.audioConfig.enabled) {
      Reflect.deleteProperty(this._api.stage()._slots, group.id);
    }

    return group;
  }

  _cleanUp () {
    this._groups = [];
    this._joinedGroupsRequested = false;
  }
};
