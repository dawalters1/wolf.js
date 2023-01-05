import { Event, ServerEvents } from '../../../constants/index.js';

class Processor {
  constructor (client) {
    this.client = client;

    (async () => {
      this.handlers = await Object.entries(ServerEvents).reduce(async (result, value) => {
        const groups = Object.entries(value[1]);
        const processGroup = async (route, group) => {
          // There are no more subGroups in the grouping
          if (typeof (group[1]) === 'string') {
            (await result)[`${group[1]}`] = (await import(`./${route.toLowerCase()}/${group[0]}.js`)).default;
          } else { // There are more subGroups in the grouping, process them
            await Object.entries(group[1]).forEach(async (subGroup) => await processGroup(`${route}/${group[0]}`, subGroup));
          }
        };

        // Process the groupings
        for (const group of groups) {
          await processGroup(value[0], group);
        }

        return await result;
      }, {});
    })();
  }

  async process (eventString, data) {
    this.client.emit(Event.PACKET_RECEIVED, eventString, data);

    const handler = this.handlers[eventString];
    const body = data?.body ?? data;

    if (!handler) {
      return this.client.emit(Event.INTERNAL_ERROR, new Error(`Unhandled socket event: ${eventString}`));
    }

    return handler(this.client, body);
  }
}

export default Processor;
