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

  /** @internal */
  protected parseBody<T> (body: unknown): T {
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      const entries = Object.entries(body);
      if (entries.every(([key]) => !isNaN(Number(key)))) {
        return new Map(
          entries.map(([key, value]) =>
            [
              Number(key),
              value instanceof WOLFResponse
                ? value
                : new WOLFResponse(
                  {
                    code: value.code,
                    body: value.body,
                    headers: value.headers
                  }
                )
            ]
          )
        ) as T;
      }
    }

    return body as T;
  }

  constructor ({ code, body, headers }: ServerResponse) {
    this.code = code;
    this.body = this.parseBody<T>(body);
    this.headers = new Map(Object.entries(headers ?? {}));
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

export default WOLFResponse;
