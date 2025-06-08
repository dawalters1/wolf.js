import { HttpStatusCode } from 'axios';
import { StatusCodes } from 'http-status-codes';

interface ServerResponse {
  code: HttpStatusCode,
  body?: unknown,
  headers: Map<string, any>;
}

export class WOLFResponse<T = undefined> {
  code: HttpStatusCode;
  body: T;
  headers: Map<string, any> = new Map();

  constructor ({ code, body, headers }: ServerResponse) {
    this.code = code;
    this.body = body as T;
    this.headers = new Map(Object.entries(headers ?? {}));
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

export default WOLFResponse;
