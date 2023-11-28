import { Event, ServerEvents } from '../../../constants/index.js';
import WOLFAPIError from '../../../models/WOLFAPIError.js';

class Processor {
  /**
   * @param {import('../../WOLF.js').default} client
   */
  constructor (client) {
    this.client = client;
    this.handlers = null;
  }

  async _loadHandlers () {
    if (this.handlers) { return; }

    this.handlers = {};

    const loadEventGroup = async (route, group) => {
      // There are no more subGroups in the grouping
      if (typeof (group[1]) === 'string') {
        try {
          this.handlers[`${group[1]}`] = (await import(`./${route.toLowerCase()}/${group[0]}.js`)).default;
        } catch (error) {
          return this.client.emit(Event.INTERNAL_ERROR, new WOLFAPIError('Expected event does not have handler', { event: group[0] }));
        }
      } else { // There are more subGroups in the grouping, process them
        await Promise.all(
          Object.entries(group[1])
            .map((subGroup) =>
              loadEventGroup(`${route}/${group[0]}`, subGroup)
            )
        );
      }
    };

    for (const serverEvent of Object.entries(ServerEvents)) {
      await Promise.all(
        Object.entries(serverEvent[1])
          .map((group) =>
            loadEventGroup(serverEvent[0], group)
          )
      );
    }
  }

  async process (eventString, data) {
    await this._loadHandlers();

    this.client.emit(Event.PACKET_RECEIVED, eventString, data);

    const handler = this.handlers[eventString];
    const body = data?.body ?? data;

    if (!handler) {
      return this.client.emit(Event.INTERNAL_ERROR, new WOLFAPIError('Unhandled socket event', { eventString, data }));
    }

    return handler(this.client, body);
  }
}

export default Processor;
