import * as Effect from "effect/Effect";
import { DecodeError } from "./error.js";
import { decode } from "./utils.js";
import { dual } from "effect/Function";
import { Body } from "./body.js";

export const json = decode((request: Request) => request.json());

export const blob = decode((request: Request) => request.blob());

export const text = decode((response: Request) => response.text());

export const formData = decode((request: Request) => request.formData());

export const arrayBuffer = decode((request: Request) => request.arrayBuffer());

export class HttpRequest {
  private _request: Request | null = null;

  constructor(
    readonly url_: string | URL | HttpRequest,
    readonly init?: RequestInit
  ) {}

  get request(): Request {
    if (this._request !== null) {
      return this._request;
    }

    const req =
      this.url_ instanceof HttpRequest
        ? this.url_.request
        : new Request(this.url_, this.init);
    this._request = req;
    return req;
  }

  get url(): string {
    return this.request.url;
  }

  get cache(): RequestCache {
    return this.request.cache;
  }

  get credentials(): RequestCredentials {
    return this.request.credentials;
  }

  get destination(): RequestDestination {
    return this.request.destination;
  }

  get headers(): Headers {
    return this.request.headers;
  }

  get integrity(): string {
    return this.request.integrity;
  }

  get keepalive(): boolean {
    return this.request.keepalive;
  }

  get method(): string {
    return this.request.method;
  }

  get mode(): RequestMode {
    return this.request.mode;
  }

  get redirect(): RequestRedirect {
    return this.request.redirect;
  }

  get referrer(): string {
    return this.request.referrer;
  }

  get referrerPolicy(): ReferrerPolicy {
    return this.request.referrerPolicy;
  }

  get signal(): AbortSignal {
    return this.request.signal;
  }

  get body(): ReadableStream<Uint8Array> | null {
    return this.request.body;
  }

  get bodyUsed(): boolean {
    return this.request.bodyUsed;
  }

  clone(): HttpRequest {
    return new HttpRequest(this.url, this.init);
  }

  arrayBuffer(): Effect.Effect<never, DecodeError, ArrayBuffer> {
    return arrayBuffer(this.request);
  }

  blob(): Effect.Effect<never, DecodeError, Blob> {
    return blob(this.request);
  }

  formData(): Effect.Effect<never, DecodeError, FormData> {
    return formData(this.request);
  }

  json(): Effect.Effect<never, DecodeError, any> {
    return json(this.request);
  }

  text(): Effect.Effect<never, DecodeError, string> {
    return text(this.request);
  }
}

export const make = (url: string | URL, init?: RequestInit) =>
  new Request(url, init);

export const map = dual<
  <B>(fn: (request: Request) => B) => (request: Request) => B,
  <B>(request: Request, fn: (request: Request) => B) => B
>(2, (request, fn) => fn(request));

export const appendBody = (body: Body) => {
  return (request: HttpRequest) => {
    const { headers = {}, ...init } = request.init ?? {};
    return new Request(request.url, {
      ...init,
      body: body.value,
      headers: { ...headers, ...body.headers },
    });
  };
};
