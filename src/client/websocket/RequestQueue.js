import { Event } from '../../constants/index.js';
import { Response } from '../../models/index.js';
import TokenBucket from 'tokenbucket';

class RequestQueue {
  constructor (client, { name = 'default', size = 10, tokensToAddPerInterval = 1, interval = 1000 }) {
    this.client = client;
    this.name = name;
    this.bucket = new TokenBucket(
      {
        size,
        tokensToAddPerInterval,
        interval
      }
    );

    this.queue = [];

    this._processing = false;
  }

  enqueue (request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.dequeue();
    });
  }

  async dequeue () {
    if (!this.queue.length || this._processing) {
      return Promise.resolve();
    }

    this._processing = true;

    const sendRequest = async (item) => {
      if (!this.bucket.removeTokensSync(1)) {
        const msFromNow = (this.bucket.lastFill + this.bucket.interval) - Date.now();

        this.client.emit(
          Event.RATE_LIMIT,
          {
            queue: this.name,
            until: Date.now() + msFromNow
          }
        );

        await this.client.utility.delay(msFromNow);

        return await sendRequest(item);
      }

      const { command, body } = item.request;

      this.client.websocket.socket.emit(command, body,
        async resp => {
          const response = new Response(resp);

          if (!response.success) {
            if (this.client._frameworkConfig.get('connection.requests.retryCodes').includes(response.code) && item.request?.attempts < this.client._frameworkConfig.get('connection.requests.attempts')) {
              item.request.attempts = item.request.attempts ? item.request.attempts += 1 : 1;

              return await sendRequest(item);
            }
            this.client.emit(Event.PACKET_FAILED, item.request.command, item.request.body);
          }
          item.resolve(response);
          this._processing = false;
          this.dequeue();
        }
      );

      this.client.emit(item.request.attempts ? Event.PACKET_RETRY : Event.PACKET_SENT, item.request.command, item.request.body, item.request.attempts);
    };

    return await sendRequest(this.queue.shift());
  }
}

export default RequestQueue;
