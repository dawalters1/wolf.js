import { StatusCodes } from 'http-status-codes';

export default class WOLFResponse {
  constructor (entity) {
    this.code = entity.code;

    if (entity.body) {
      this.body = entity.body;
    }

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
