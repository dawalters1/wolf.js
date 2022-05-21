const { Event } = require('../../constants');

class RequestQueue {
  constructor (client, config) {
    this.client = client;
    this.queue = [];
    this.name = config.name;

    this.capacity = config.capacity;
    this.available = config.capacity;

    this.tokenLastAdded = Date.now();
    this.regenerationPeriod = config.regenerationPeriod;

    this.processing = false;

    setInterval(() => {
      if (this.available < this.capacity) {
        this.available++;
      }
    }, this.regenerationPeriod);
  }

  enqueue (request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject
      });
      this.dequeue();
    });
  }

  dequeue () {
    if (!this.queue.length || this.processing) {
      return Promise.resolve();
    }

    this.processing = true;

    try {
      setTimeout(async () => {
        this.available--;

        const item = this.queue.shift();

        this.client.websocket.socket.emit(item.request.command, item.request.body, response => item.resolve(response));
      }, this.getWaitTime());
    } catch (error) {
      console.log('Request error occurred', error);
    } finally {
      this.processing = false;
      this.dequeue();
    }
  }

  getWaitTime () {
    if (this.available > 0) {
      return 0;
    }

    const until = this.regenerationPeriod - Date.now();

    this.client.emit(
      Event.RATE_LIMIT,
      {
        queue: this.name,
        until
      }
    );

    return until;
  }
}

module.exports = RequestQueue;