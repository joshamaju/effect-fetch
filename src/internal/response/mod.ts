import { flow } from "effect/Function";
import * as Effect from "effect/Effect";
import type { Predicate } from "effect/Predicate";

import { DecodeError } from "../error.js";
import { decode } from "../utils.js";
import { OkStatusCode, StatusCode } from "./types.js";

export class StatusError {
  readonly _tag = "StatusError";
  constructor(readonly response: Response) {}
}

export const json = decode((response: Response) => response.json());

export const blob = decode((response: Response) => response.blob());

export const text = decode((response: Response) => response.text());

export const formData = decode((response: Response) => response.formData());

export const arrayBuffer = decode((response: Response) =>
  response.arrayBuffer()
);

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

export class HttpResponseT<S extends StatusCode> extends HttpResponse {
  get status(): S {
    return super.status as S;
  }
}