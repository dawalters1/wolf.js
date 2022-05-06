const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const { Command } = require('../../constants');

// const models = require('../../models');

class Group extends Base {
  constructor (client) {
    super(client, 'id');
  }

  async getGroupEvents (targetGroupId, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('Unknown Group', targetGroupId);
    }

    if (!forceNew && group.events.length) {
      return group.events;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_LIST,
      {
        id: targetGroupId,
        subscribe: true
      }
    );

    if (response.success) {
      group.events = response.body.length ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];
    }

    return group.events;
  }

  async create () {

  }

  async update () {

  }

  async delete () {

  }
}

module.exports = Group;
