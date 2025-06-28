
class EventRegistry {
  constructor () {
    this.handlers = new Map();
  }

  register (handler) {
    const eventName = handler.event;
    this.handlers.set(eventName, handler);
  }

  get (event) {
    return this.handlers.get(event) ?? null;
  }

  getHandlers () {
    return this.handlers;
  }
}

export default EventRegistry;
