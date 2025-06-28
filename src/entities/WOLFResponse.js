import { StatusCodes } from 'http-status-codes';

export class WOLFResponse {
  constructor (entity) {
    this.code = entity.code;
    this.body = entity.body;

    if (entity.headers) {
      this.headers = entity.headers instanceof Map
        ? entity.headers
        : new Map(Object.entries(entity.headers ?? {}));
    }
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

export default WOLFResponse;
