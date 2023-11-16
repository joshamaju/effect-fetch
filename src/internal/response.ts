import { flow } from "effect/Function";
import * as Effect from "effect/Effect";
import type { Predicate } from "effect/Predicate";

export class DecodeError {
  readonly _tag = "DecodeError";
  constructor(readonly cause: unknown) {}
}

export class StatusError {
  readonly _tag = "StatusError";
  constructor(readonly response: Response) {}
}

const to = <T>(fn: (response: Response) => Promise<T>) => {
  return (response: Response) =>
    Effect.tryPromise({
      try: () => fn(response),
      catch: (error) => new DecodeError(error),
    });
};

export const json = to((response) => response.json());

export const blob = to((response) => response.blob());

export const formData = to((response) => response.formData());

export const arrayBuffer = to((response) => response.arrayBuffer());

export const text = to((response) => response.text());

export const filterStatusOk = (response: Response) => {
  return response.ok
    ? Effect.succeed(response)
    : Effect.fail(new StatusError(response));
};

export const filterStatusOkT = flow(filterStatusOk, (response) =>
  Effect.map(
    response,
    (r) => new HttpResponseT<Exclude<StatusCode, OkStatusCode>>(r)
  )
);

export const filterStatus =
  (fn: Predicate<Response>) => (response: Response) => {
    return fn(response)
      ? Effect.succeed(response)
      : Effect.fail(new StatusError(response));
  };

export class HttpResponse {
  constructor(readonly response: Response) {}

  get headers(): Headers {
    return this.response.headers;
  }

  get ok(): boolean {
    return this.response.ok;
  }

  get redirected(): boolean {
    return this.response.redirected;
  }

  get status(): number {
    return this.response.status;
  }

  get statusText(): string {
    return this.response.statusText;
  }

  get type(): ResponseType {
    return this.response.type;
  }

  get url(): string {
    return this.response.url;
  }

  get body(): ReadableStream<Uint8Array> | null {
    return this.response.body;
  }

  get bodyUsed(): boolean {
    return this.response.bodyUsed;
  }

  clone(): Effect.Effect<never, Error, Response> {
    return Effect.try({
      try: () => this.response.clone(),
      catch: (error) => error as Error,
    });
  }

  arrayBuffer(): Effect.Effect<never, DecodeError, ArrayBuffer> {
    return arrayBuffer(this.response);
  }

  blob(): Effect.Effect<never, DecodeError, Blob> {
    return blob(this.response);
  }

  formData(): Effect.Effect<never, DecodeError, FormData> {
    return formData(this.response);
  }

  json(): Effect.Effect<never, DecodeError, any> {
    return json(this.response);
  }

  text(): Effect.Effect<never, DecodeError, string> {
    return text(this.response);
  }
}

type OkStatusCode =
  | 200 // OK
  | 201 // Created
  | 202 // Accepted
  | 203 // Non-Authoritative Information
  | 204 // No Content
  | 205 // Reset Content
  | 206 // Partial Content
  | 207 // Multi-Status
  | 208 // Already Reported
  | 226; // IM Used

type StatusCode =
  | 100 // Continue
  | 101 // Switching Protocols
  | 102 // Processing
  | 103 // Early Hints
  | OkStatusCode
  | 300 // Multiple Choices
  | 301 // Moved Permanently
  | 302 // Found
  | 303 // See Other
  | 304 // Not Modified
  | 305 // Use Proxy
  | 306 // (Unused)
  | 307 // Temporary Redirect
  | 308 // Permanent Redirect
  | 400 // Bad Request
  | 401 // Unauthorized
  | 402 // Payment Required
  | 403 // Forbidden
  | 404 // Not Found
  | 405 // Method Not Allowed
  | 406 // Not Acceptable
  | 407 // Proxy Authentication Required
  | 408 // Request Timeout
  | 409 // Conflict
  | 410 // Gone
  | 411 // Length Required
  | 412 // Precondition Failed
  | 413 // Payload Too Large
  | 414 // URI Too Long
  | 415 // Unsupported Media Type
  | 416 // Range Not Satisfiable
  | 417 // Expectation Failed
  | 418 // I'm a teapot
  | 421 // Misdirected Request
  | 422 // Unprocessable Entity
  | 423 // Locked
  | 424 // Failed Dependency
  | 425 // Too Early
  | 426 // Upgrade Required
  | 428 // Precondition Required
  | 429 // Too Many Requests
  | 431 // Request Header Fields Too Large
  | 451 // Unavailable For Legal Reasons
  | 500 // Internal Server Error
  | 501 // Not Implemented
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504 // Gateway Timeout
  | 505 // HTTP Version Not Supported
  | 506 // Variant Also Negotiates
  | 507 // Insufficient Storage
  | 508 // Loop Detected
  | 510 // Not Extended
  | 511; // Network Authentication Required

export class HttpResponseT<S extends StatusCode> extends HttpResponse {
  get status(): S {
    return super.status as S;
  }
}
