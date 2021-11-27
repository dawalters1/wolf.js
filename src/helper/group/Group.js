const BaseHelper = require('../BaseHelper');
const GroupObject = require('../../models/GroupObject');
const GroupSubscriber = require('../../models/GroupSubscriberObject');
const Message = require('../../models/MessageObject');
const Response = require('../../models/ResponseObject');

const patch = require('../../utils/Patch');
const { Commands, Capability, AdminAction } = require('../../constants');
const validator = require('../../validator');
const fileType = require('file-type');

const toLanguageKey = require('../../utils/ToLanguageKey');
const GroupProfileBuilder = require('../../utils/ProfileBuilders/Group');

class Group extends BaseHelper {
  constructor (api) {
    super(api);

    this._groups = [];

    this._joinedGroupsFetched = false;
  }

  async _joinedGroups () {
    if (this._joinedGroupsFetched) {
      return this._groups.filter((group) => group.inGroup);
    }

    const result = await this._websocket.emit(
      Commands.SUBSCRIBER_GROUP_LIST,
      {
        subscribe: true
      }
    );

    if (result.success) {
      this._joinedGroupsFetched = true;

      const groups = await this.getByIds(result.body.map((group) => group.id));

      for (const group of groups) {
        group.inGroup = true;
        group.capabilities = result.body.find((grp) => group.id === grp.id).capabilities || Capability.REGULAR;
      }
    }

    return this._groups.find((group) => group.inGroup);
  }

  async list () {
    return this._groups.filter((group) => group.inGroup || (group.subscribers && group.subscribers.length > 0));
  }

  async getById (targetGroupId, requestNew = false) {
    return (await this.getByIds(targetGroupId, requestNew))[0];
  }

  async getByIds (targetGroupIds, requestNew = false) {
    try {
      targetGroupIds = Array.isArray(targetGroupIds) ? [...new Set(targetGroupIds)] : [targetGroupIds];

      if (targetGroupIds.length === 0) {
        throw new Error('targetGroupIds cannot be an empty array');
      }
      for (const targetGroupId of targetGroupIds) {
        if (validator.isNullOrUndefined(targetGroupId)) {
          throw new Error('targetGroupId cannot be null or undefined');
        } else if (!validator.isValidNumber(targetGroupId)) {
          throw new Error('targetGroupId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
          throw new Error('targetGroupId cannot be less than or equal to 0');
        }
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      let groups = [];

      if (!requestNew) {
        groups = this._groups.filter((group) => targetGroupIds.includes(group.id));
      }

      if (groups.length !== targetGroupIds.length) {
        const targetGroupIdsToRequest = targetGroupIds.filter((targetGroupId) => !groups.some((group) => group.id === targetGroupId));

        for (const targetGroupIdBatch of this._api.utility().array().chunk(targetGroupIdsToRequest, this._api._botConfig.batch.length)) {
          const result = await this._websocket.emit(
            Commands.GROUP_PROFILE,
            {
              headers: {
                version: 4
              },
              body: {
                idList: targetGroupIdBatch,
                subscribe: true,
                entities: ['base', 'extended', 'audioCounts', 'audioConfig']
              }
            }
          );

          if (result.success) {
            const groupResponses = Object.values(result.body).map((groupResponse) => new Response(groupResponse, Commands.GROUP_PROFILE));

            for (const [index, groupResponse] of groupResponses.entries()) {
              if (groupResponse.success) {
                const body = groupResponse.body;
                const base = body.base;
                base.extended = body.extended;
                base.audioConfig = body.audioConfig;
                base.audioCounts = body.audioCounts;
                base.exists = true;

                groups.push(this._process(base));
              } else {
                groups.push(
                  {
                    id: targetGroupIdBatch[index],
                    exists: false
                  }
                );
              }
            }
          } else {
            groups.push(
              ...targetGroupIdBatch.map((id) =>
                (
                  {
                    id,
                    exists: false
                  }
                )
              )
            );
          }
        }
      }

      return groups;
    } catch (error) {
      error.internalErrorMessage = `api.group().getByIds(targetGroupIds=${JSON.stringify(targetGroupIds)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getByName (targetGroupName, requestNew = false) {
    try {
      if (validator.isNullOrUndefined(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or empty');
      }

      if (!requestNew && this._groups.find((group) => this._api.utility().string().isEqual(group.name, targetGroupName))) {
        return this._groups.find((group) => this._api.utility().string().isEqual(group.name, targetGroupName));
      }

      const result = await this._websocket.emit(
        Commands.GROUP_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            name: targetGroupName.toLowerCase(),
            subscribe: true,
            entities: ['base', 'extended', 'audioCounts', 'audioConfig']
          }
        }
      );

      if (result.success) {
        const body = result.body;
        const base = body.base;
        base.extended = body.extended;
        base.audioConfig = body.audioConfig;
        base.audioCounts = body.audioCounts;
        base.exists = true;

        return this._process(base);
      } else {
        return {
          id: 0,
          name: targetGroupName,
          exists: false
        };
      }
    } catch (error) {
      error.internalErrorMessage = `api.group().getByName(targetGroupName=${JSON.stringify(targetGroupName)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async joinById (targetGroupId, password = undefined) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (!validator.isNullOrUndefined(password)) {
        if (validator.isNullOrWhitespace(password)) {
          throw new Error('password cannot be null or empty');
        }
      }

      return await this._websocket.emit(
        Commands.GROUP_MEMBER_ADD,
        {
          groupId: targetGroupId,
          password
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.group().joinById(targetGroupId=${JSON.stringify(targetGroupId)}, password=${JSON.stringify(password)})`;
      throw error;
    }
  }

  async joinByName (targetGroupName, password = undefined) {
    try {
      if (validator.isNullOrUndefined(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or empty');
      }
      if (!validator.isNullOrUndefined(password)) {
        if (validator.isNullOrWhitespace(password)) {
          throw new Error('password cannot be null or empty');
        }
      }

      return await this._websocket.emit(
        Commands.GROUP_MEMBER_ADD,
        {
          name: targetGroupName.toLowerCase(),
          password
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.group().joinByName(targetGroupName=${JSON.stringify(targetGroupName)}, password=${JSON.stringify(password)})`;
      throw error;
    }
  }

  async leaveById (targetGroupId) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.GROUP_MEMBER_DELETE,
        {
          groupId: targetGroupId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.group().leaveById(targetGroupId=${JSON.stringify(targetGroupId)})`;
      throw error;
    }
  }

  async leaveByName (targetGroupName) {
    try {
      if (validator.isNullOrUndefined(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(targetGroupName)) {
        throw new Error('targetGroupName cannot be null or empty');
      }

      return await this.leaveById((await this.getByName(targetGroupName)).id);
    } catch (error) {
      error.internalErrorMessage = `api.group().leaveByName(targetGroupName=${JSON.stringify(targetGroupName)})`;
      throw error;
    }
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use {@link getChatHistory}
   */
  async getHistory (targetGroupId, timestamp = 0, limit = 15) {
    return await this.getChatHistory(targetGroupId, false, timestamp, limit);
  }

  async getChatHistory (targetGroupId, chronological, timestamp = 0, limit = 15) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (!validator.isValidBoolean(chronological)) {
        throw new Error('chronological must be a valid boolean');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanZero(timestamp)) {
        throw new Error('timestamp cannot be less than 0');
      }
      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (limit < 5) {
        throw new Error('limit cannot be less than 5');
      } else if (limit > 30) {
        throw new Error('limit cannot be larger than 30');
      }

      const result = await this._websocket.emit(
        Commands.MESSAGE_GROUP_HISTORY_LIST,
        {
          headers: {
            version: 3
          },
          body: {
            id: targetGroupId,
            limit,
            chronological,
            timestampEnd: timestamp === 0 ? undefined : timestamp
          }
        }
      );

      return result.success ? result.body.map((message) => new Message(this._api, message)) : [];
    } catch (error) {
      error.internalErrorMessage = `api.group().getChatHistory(targetGroupId=${JSON.stringify(targetGroupId)}, chronological=${JSON.stringify(chronological)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)})`;
      throw error;
    }
  }

  async getSubscriberList (targetGroupId, requestNew = false) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      const group = await this.getById(targetGroupId);

      if (!requestNew && group.subscribers && group.subscribers.length >= group.members) {
        return group.subscribers;
      }

      const result = await this._websocket.emit(
        Commands.GROUP_MEMBER_LIST,
        {
          headers: {
            version: 3
          },
          body: {
            id: targetGroupId,
            subscribe: true
          }
        }
      );

      if (result.success) {
        group.inGroup = true;
        group.subscribers = result.body.map((subscriber) => new GroupSubscriber(this._api, subscriber));
      }

      return group.subscribers;
    } catch (error) {
      error.internalErrorMessage = `api.group().getSubscriberList(targetGroupId=${JSON.stringify(targetGroupId)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getStats (targetGroupId, requestNew = false) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      const group = await this.getById(targetGroupId);

      if (!requestNew && group.stats) {
        return group.stats;
      }

      const result = await this._websocket.emit(
        Commands.GROUP_STATS,
        {
          id: targetGroupId
        }
      );

      if (result.success) {
        group.stats = result.body;
      }

      return group.stats;
    } catch (error) {
      error.internalErrorMessage = `api.group().getStats(targetGroupId=${JSON.stringify(targetGroupId)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  create () {
    return new GroupProfileBuilder(this._api);
  }

  update (group) {
    return new GroupProfileBuilder(this._api)._update(group);
  }

  async updateAvatar (targetGroupId, avatar) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrWhitespace(avatar)) {
        throw new Error('avatar cannot be null or whitespace');
      } else if (!validator.isBuffer(avatar)) {
        throw new Error('avatar must be a valid buffer');
      }

      return this._api.multiMediaService().uploadGroupAvatar(targetGroupId, avatar, (await fileType.fromBuffer(avatar)).mime);
    } catch (error) {
      error.internalErrorMessage = `api.group().updateAvatar(targetGroupId=${JSON.stringify(targetGroupId)}, avatar=${JSON.stringify(avatar ? 'Buffer -- Too long to display' : avatar)})`;
      throw error;
    }
  }

  async updateSubscriber (targetGroupId, targetSubscriberId, capabilities) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(capabilities)) {
        throw new Error('capabilities cannot be null or undefined');
      } else if (!validator.isValidNumber(capabilities)) {
        throw new Error('capabilities must be a valid number');
      } else if (!Object.values(AdminAction).includes(capabilities)) {
        throw new Error('capabilities is not valid');
      }

      return await this._websocket.emit(
        Commands.GROUP_MEMBER_UPDATE,
        {
          groupId: targetGroupId,
          id: targetSubscriberId,
          capabilities
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.group().updateSubscriber(targetGroupId=${JSON.stringify(targetGroupId)}, targetSubscriberId=${JSON.stringify(targetSubscriberId)}, capabilities=${capabilities})`;
      throw error;
    }
  }

  async getRecommendedList () {
    try {
      const result = await this._websocket.emit(Commands.GROUP_RECOMMENDATION_LIST);

      if (result.success) {
        return await this.getByIds(result.body.map((idHash) => idHash.id));
      }

      return [];
    } catch (error) {
      error.internalErrorMessage = 'api.group().getRecommendedList()';
      throw error;
    }
  }

  async _cleanup () {
    this._groups = [];
  }

  _process (group) {
    group = new GroupObject(this._api, group);
    group.language = toLanguageKey(group.extended.language);

    const existing = this._groups.find((grp) => grp.id === group.id);

    if (existing) {
      patch(existing, group);
    } else {
      this._groups.push(group);
    }

    return group;
  }
}

module.exports = Group;
