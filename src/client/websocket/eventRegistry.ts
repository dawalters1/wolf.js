import BaseEvent from './events/baseEvent';
type ExtractEventName<T> = T extends { event: infer N } ? N & string : string;
type ExtractArgs<T> = T extends BaseEvent<infer A> ? A : unknown;

class EventRegistry<Events extends Record<string, any> = {}> {
  private handlers = new Map<keyof Events & string, BaseEvent<any>>();
  register<T extends BaseEvent<any>> (handler: T): asserts this is EventRegistry<Events & { [K in ExtractEventName<T>]: ExtractArgs<T> }> {
    const eventName = handler.event as ExtractEventName<T>;
    this.handlers.set(eventName, handler);
  }

  get (event: string): BaseEvent<Events[string]> | null {
    return this.handlers.get(event) ?? null;
  }

  getHandlers () {
    return this.handlers;
  }
}

export default EventRegistry;
