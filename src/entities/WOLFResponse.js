import { StatusCodes } from 'http-status-codes';

<<<<<<< HEAD
export default class WOLFResponse {
=======
export class WOLFResponse {
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82
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
<<<<<<< HEAD
=======

export default WOLFResponse;
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82
