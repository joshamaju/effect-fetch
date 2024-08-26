import { dual } from "effect/Function";
import { Body } from "./body.js";
import { decode } from "./utils.js";

export const json = decode((request: Request) => request.json());

export const blob = decode((request: Request) => request.blob());

export const text = decode((response: Request) => response.text());

export const formData = decode((request: Request) => request.formData());

export const arrayBuffer = decode((request: Request) => request.arrayBuffer());

export class HttpRequest {
  private _request: Request | null = null;

  constructor(
    private _url: string | URL | HttpRequest,
    readonly init?: RequestInit
  ) {}

  get request(): Request {
    if (this._request !== null) {
      return this._request;
    }

    const req =
      this.url instanceof HttpRequest
        ? this.url.request
        : new Request(this.url, this.init);
    this._request = req;
    return req;
  }

  get url(): string | URL {
    return this._url instanceof HttpRequest ? this._url.url : this._url;
  }

  clone(): HttpRequest {
    return new HttpRequest(this.url, this.init);
  }
}

export const make = (url: string | URL, init?: RequestInit) =>
  new HttpRequest(url, init);

export const map = dual<
  <B>(fn: (request: HttpRequest) => B) => (request: HttpRequest) => B,
  <B>(request: HttpRequest, fn: (request: HttpRequest) => B) => B
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
