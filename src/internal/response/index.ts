import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import type { Predicate } from "effect/Predicate";

import { DecodeError } from "../error.js";
import { decode } from "../utils.js";
import { NotOkStatusCode, OkStatusCode, StatusCode } from "./types.js";

export class StatusError {
  readonly _tag = "StatusError";
  constructor(readonly response: Response) {}
}

export interface StatusErrorT<S extends number> extends StatusError {
  response: Omit<Response, "status"> & { status: S };
}

export const json = decode((response: Response) => response.json());

export const blob = decode((response: Response) => response.blob());

export const text = decode((response: Response) => response.text());

export const formData = decode((response: Response) => response.formData());

export const arrayBuffer = decode((response: Response) =>
  response.arrayBuffer()
);

export const filterStatusOk = (response: Response) => {
  return Effect.if(response.ok, {
    onTrue: () => Effect.succeed(response),
    onFalse: () => Effect.fail(new StatusError(response)),
  });
};

export interface ResponseT<S extends StatusCode> extends Response {
  status: S;
}

export const filterStatusOkT = flow(
  filterStatusOk,
  Effect.mapBoth({
    onSuccess: (r) => r as ResponseT<OkStatusCode>,
    onFailure: (e) => e as StatusErrorT<NotOkStatusCode>,
  })
);

export const filterStatus = (response: Response, fn: Predicate<number>) => {
  return Effect.if(fn(response.status), {
    onTrue: () => Effect.succeed(response),
    onFalse: () => Effect.fail(new StatusError(response))
  })
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

  clone(): Effect.Effect<Response, Error, never> {
    return Effect.try({
      try: () => this.response.clone(),
      catch: (error) => error as Error,
    });
  }

  arrayBuffer(): Effect.Effect<ArrayBuffer, DecodeError, never> {
    return arrayBuffer(this.response);
  }

  blob(): Effect.Effect<Blob, DecodeError, never> {
    return blob(this.response);
  }

  formData(): Effect.Effect<FormData, DecodeError, never> {
    return formData(this.response);
  }

  json(): Effect.Effect<any, DecodeError, never> {
    return json(this.response);
  }

  text(): Effect.Effect<string, DecodeError, never> {
    return text(this.response);
  }
}
