const { Event, ServerEvents } = require('../../../constants');

class Processor {
  constructor (client) {
    this.client = client;

    this.handlers = Object.entries(ServerEvents).reduce((result, value) => {
      const groups = Object.entries(value[1]);

      const processGroup = (route, group) => {
        // There are no more subGroups in the grouping
        if (typeof (group[1]) === 'string') {
          result[`${group[1]}`] = require(`./${route.toLowerCase()}/${group[0]}.js`);
        } else { // There are more subGroups in the grouping, process them
          Object.entries(group[1]).forEach((subGroup) => processGroup(`${route}/${group[0]}`, subGroup));
        }
      };

      // Process the groupings
      groups.forEach((element) => processGroup(value[0], element));

      return result;
    }, {});
  }

  async process (eventString, data) {
    this.client.emit(
      Event.PACKET_RECEIVED,
      eventString,
      data
    );

    const handler = this._handlers[eventString];
    const body = data?.body ?? data;

    if (handler) {
      return handler(this.client, body);
    }

    return this.client.emit(
      Event.INTERNAL_ERROR,
      `Unhandled socket event: ${eventString}`
    );
  }
}

module.exports = Processor;
