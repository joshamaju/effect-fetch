import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Client, Config, Handler } from "../Client.js";
import * as Fetch from "../Fetch.js";
import type { Interceptor, Interceptors, Merge } from "../Interceptor.js";
import {
  add,
  copy,
  empty,
  make as makeInterceptor,
  provide,
} from "../Interceptor.js";
import { Timeout } from "../Interceptors/Timeout.js";
import { Url } from "../Interceptors/Url.js";
import { isBody } from "./body.js";
import { filterStatusOk } from "./response/index.js";

type Method = NonNullable<RequestInit["method"]>;

export const make = Effect.gen(function* () {
  const fetch = yield* Fetch.Fetch;

  const withMethod = (method: Method): Handler => {
    return (url, init) => {
      let body: RequestInit["body"];
      let headers: RequestInit["headers"];

      if (isBody(init)) {
        body = init.value;
        if (init.headers) headers = init.headers;
      } else {
        let local_body = init?.body;
        let local_headers = init?.headers;

        if (local_body && isBody(local_body)) {
          const body = local_body;

          if (local_headers) {
            const headers = new Headers(local_headers);

            for (const key in body.headers) {
              headers.set(key, body.headers[key]);
            }

            local_headers = headers;
          } else {
            local_headers = body.headers;
          }

          local_body = body.value;
        }

        body = local_body;
        headers = local_headers;
      }

      return Effect.flatMap(
        fetch(url, { ...init, body, method, headers }),
        filterStatusOk
      );
    };
  };

  const get = withMethod("GET");

  const put = withMethod("PUT");

  const post = withMethod("POST");

  const head = withMethod("HEAD");

  const patch = withMethod("PATCH");

  const delete_ = withMethod("DELETE");

  const options = withMethod("OPTIONS");

  return Client.of({ get, put, post, head, patch, options, delete: delete_ });
});

type MaybeMerge<I extends Interceptors<any, any>, T> = T extends Interceptor<
  any,
  any
>
  ? Merge<I, T>
  : I;

export const create = <E, R>({
  url,
  timeout,
  adapter,
  interceptors = empty(),
}: Config<E, R>) => {
  const clone = copy(interceptors);
  const baseurl_interceptor = url ? Url(url) : null;

  const timeout_interceptor =
    typeof timeout !== "undefined" ? Timeout(timeout) : null;

  type Interceptors = MaybeMerge<
    MaybeMerge<typeof clone, typeof baseurl_interceptor>,
    typeof timeout_interceptor
  >;

  let interceptors_: Interceptors = baseurl_interceptor
    ? Chunk.prepend(clone, baseurl_interceptor)
    : clone;

  if (timeout_interceptor) {
    interceptors_ = add(interceptors_, timeout_interceptor);
  }

  const adapter_ = Chunk.isEmpty(interceptors_)
    ? Effect.succeed(adapter)
    : provide(makeInterceptor(interceptors_), adapter);

  return Effect.provide(make, Fetch.effect(adapter_));
};

export const layer = Layer.effect(Client, make);
