import { StatusCodes } from 'http-status-codes';

export default class WOLFResponse {
  constructor (entity) {
    this.code = entity.code;

    if (entity.body) {
      this.body = entity.body;
    }

    if (entity.headers) {
      const headers = entity.headers instanceof Map
        ? new Map(entity.headers)
        : new Map(Object.entries(entity.headers));

      const cacheControl = headers.get('cache-control');

      if (cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/);

        headers.set('maxAge', Number(match[1]));
        headers.delete('cache-control');
      }

      this.headers = headers;
    }
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}
