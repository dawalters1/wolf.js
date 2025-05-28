import { HttpStatusCode } from 'axios';
import { StatusCodes } from 'http-status-codes';

interface ServerResponse {
  code: HttpStatusCode,
  body?: unknown,
  headers?: Map<unknown, string>
}

export class WOLFResponse<T = undefined> {
  code: HttpStatusCode;
  body: T;
  headers?: Map<unknown, string>;

  constructor ({ code, body, headers }: ServerResponse) {
    this.code = code;
    this.body = body as T;
    this.headers = headers;
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

export default WOLFResponse;
