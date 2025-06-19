import { StatusCodes } from 'http-status-codes';

interface ServerResponse {
  code: StatusCodes,
  body?: unknown,
  headers?: Map<string, any>;
}

export class WOLFResponse<T = undefined> {
  code: StatusCodes;
  body: T;
  headers: Map<string, any> = new Map();

  constructor (data: ServerResponse) {
    this.code = data.code;
    this.body = data?.body as T;

    if (data.headers) {
      data.headers = data.headers instanceof Map
        ? data.headers
        : new Map(Object.entries(data.headers ?? {}));
    }
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

export default WOLFResponse;
