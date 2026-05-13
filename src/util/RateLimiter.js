import { TokenBucket } from 'limiter';

export default class RateLimiter {
  #entries;

  constructor (config) {
    this.#entries = new Map(
      Object.entries(config)
        .map(([key, value]) => {
          return [
            key,
            {
              key,
              bucket: new TokenBucket({
                bucketSize: value.bucketSize,
                tokensPerInterval: value.tokensPerInterval,
                interval: value.interval ?? 'second'
              }),
              queue: [],
              maxQueue: value.maxQueue,
              processing: false
            }
          ];
        })
    );
  }

  async schedule (command, task) {
    const key = command.replace(' ', '_').toUpperCase();
    const entry = this.#entries.get(key) ?? this.#entries.get('GENERIC');

    if (entry.queue.length >= entry.maxQueue) {
      // TODO: this should not throw an error
      throw new Error(`Rate limit queue full for ${key}`);
    }

    return new Promise((resolve, reject) => {
      entry.queue.push({ task, resolve, reject });
      this.#process(entry);
    });
  }

  async #process (entry) {
    if (entry.processing) { return; }

    entry.processing = true;

    while (entry.queue.length > 0) {
      const remainingTokens = await entry.bucket.removeTokens(1);

      if (remainingTokens < 0) { break; }

      const item = entry.queue.shift();

      try {
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    entry.processing = false;

    if (!entry.queue.length) { return; }

    return setTimeout(() => {
      this.#process(entry);
    }, 50);
  }
}
