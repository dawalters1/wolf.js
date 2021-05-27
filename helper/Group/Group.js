const Helper = require('../Helper');
const Response = require('../../networking/Response');
const validator = require('../../utils/validator');
const constants = require('../../constants');

const requests = {
  GROUP_PROFILE: 'group profile',
  GROUP_MEMBER_ADD: 'group member add',
  GROUP_MEMBER_UPDATE: 'group member update',
  GROUP_MEMBER_DELETE: 'group member delete',
  GROUP_MEMBER_LIST: 'group member list',
  GROUP_STATS: 'group stats',
  MESSAGE_GROUP_HISTORY_LIST: 'message group history list'
};

module.exports = class Group extends Helper {
  constructor (bot) {
    super(bot);
    this._cache = [];
  }

  async getByIds (groupIds, requestNew = false) {
    if (!validator.isValidArray(groupIds)) {
      throw new Error('groupIds must be a valid array');
    } else {
      for (const groupId of groupIds) {
        if (!validator.isValidNumber(groupId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(groupId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }
    }

    groupIds = [...new Set(groupIds)];

    const groups = [];

    if (!requestNew) {
      const cached = this._cache.filter((group) => groupIds.includes(group.id));
      if (cached.length > 0) {
        groups.push(cached);
      }
    }

    if (groups.length !== groupIds.length) {
      for (const batchGroupIdList of this._bot.utility().batchArray(groupIds.filter((groupId) => !groups.some((group) => group.id === groupId)), 50)) {
        const result = await this._websocket.emit(requests.GROUP_PROFILE, {
          headers: {
            version: 4
          },
          body: {
            idList: batchGroupIdList,
            subuscribe: true,
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
  }

  async getById (groupId, requestNew = false) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }

    return (await this.getByIds([groupId], requestNew))[0];
  }

  async getByName (targetGroupName, requestNew = false) {
    if (validator.isNullOrWhitespace(targetGroupName)) {
      throw new Error('targetGroupName cannot be null or empty');
    }

    return new Promise((resolve, reject) => {
      if (!requestNew) {
        const group = this._cache.find((grp) => grp.name.toLowerCase() === name.toLowerCase().trim());

        if (group) {
          return resolve(group);
        }

        this._websocket.emit(requests.GROUP_PROFILE, {
          headers: {
            version: 4
          },
          body: {
            name: targetGroupName,
            subuscribe: true,
            entities: ['base', 'extended', 'audioCounts', 'audioConfig']
          }
        }).then((result) => {
          if (result.success) {
            const body = result.body;
            const group = body.base;
            group.extended = body.extended;
            group.audioCounts = body.audioCounts;
            group.audioConfig = body.audioConfig;
            group.exists = true;

            return resolve(this._process(group));
          }

          return resolve({
            id: 0,
            name: targetGroupName,
            exists: false
          });
        });
      }
    });
  }

  async joinById (groupId, password = null) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(requests.GROUP_MEMBER_ADD, {
      groupId: groupId,
      password
    });
  }

  async joinByName (targetGroupName, password = null) {
    if (validator.isNullOrWhitespace(targetGroupName)) {
      throw new Error('targetGroupName cannot be null or empty');
    }
    return await this._websocket.emit(requests.GROUP_MEMBER_ADD, {
      name: targetGroupName,
      password
    });
  }

  async leaveById (groupId) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }
    return await this._websocket.emit(requests.GROUP_MEMBER_DELETE, {
      groupId: groupId
    });
  }

  async leaveByName (targetGroupName) {
    if (validator.isNullOrWhitespace(targetGroupName)) {
      throw new Error('targetGroupName cannot be null or empty');
    }
    return await this.leaveById((await this.getByName(targetGroupName)).id);
  }

  async getHistory (groupId, timestamp = 0) {
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

    const result = await this._websocket.emit(requests.MESSAGE_GROUP_HISTORY_LIST,
      {
        headers: {
          version: 3
        },
        body: {
          id: groupId,
          chronological: false,
          timestampBegin: timestamp !== 0,
          timestampEnd: timestamp === 0 ? null : timestamp
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
          embeds: message.embmeds,
          metadata: message.metadata,
          isGroup: message.isGroup,
          timestamp: message.timestamp,
          edited: message.edited
        }))
        : []
    };
  }

  async getSubscriberList (groupId, requestNew = false) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }

    const group = await this.getById(groupId);

    if (group.inGroup) {
      if (!requestNew && group.subscribers && group.subscribers.length === group.members) {
        return group.subscribers;
      }

      const result = await this._websocket.emit(requests.GROUP_MEMBER_LIST, {
        headers: {
          version: 3
        },
        body: {
          id: groupId,
          subscribe: true
        }
      });

      if (result.success) {
        group.subscribers = result.body;
      }
    }

    return group.subscribers || [];
  }

  async getStats (groupId) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }
    return await this._websocket.emit(requests.GROUP_STATS, {
      id: groupId
    });
  }

  async updateGroupSubscriber (groupId, subscriberId, capability) {
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

    return await this._websocket.emit(requests.GROUP_MEMBER_UPDATE, {
      groupId,
      id: subscriberId,
      capabilities: capability
    });
  }

  async _getJoinedGroups () {
    // TODO: Required to handled 'inGroup' and 'Capabilites'
  }

  _process (group) {
    if (group.exists) {
      const existing = this._cache.find((grp) => grp.id === group.id);

      if (existing) {
        for (const key in group) {
          existing[key] = group[key];
        }
      } else {
        this._cache.push(group);
      }
    }
    return group;
  }
};
