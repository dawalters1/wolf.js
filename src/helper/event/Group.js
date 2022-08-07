import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
class Group extends Base {
  async getEventList (targetGroupId, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }
    const group = await this.client.group.getById(targetGroupId);
    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }
    if (!forceNew && group.events.length) {
      return group.events;
    }
    const response = await this.client.websocket.emit(Command.GROUP_EVENT_LIST, {
      id: parseInt(targetGroupId),
      subscribe: true
    });
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
export default Group;
