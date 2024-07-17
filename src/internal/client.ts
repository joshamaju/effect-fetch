import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Config, Client, Handler } from "../Client.js";
import * as Fetch from "../Fetch.js";
import type { Merge } from "../Interceptor.js";
import {
  copy,
  empty,
  provide,
  make as makeInterceptor,
} from "../Interceptor.js";
import { Url } from "../Interceptors/Url.js";
import { filterStatusOk } from "./response/index.js";
import { isBody } from "./body.js";

type Method = NonNullable<RequestInit["method"]>;

export const make = Effect.gen(function* () {
  const fetch = yield* Fetch.Fetch;

  const withMethod = (method: Method): Handler => {
    return (url, init) => {
      let body: RequestInit['body'];
      let headers: RequestInit['headers'];

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

        body = local_body
        headers = local_headers
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

export const create = <E, R>({
  url,
  adapter,
  interceptors = empty(),
}: Config<E, R>) => {
  const clone = copy(interceptors);
  const interceptor = url ? Url(url) : null;

  type Interceptors = Merge<typeof clone, NonNullable<typeof interceptor>>;

  const newInterceptors: Interceptors = interceptor
    ? Chunk.prepend(clone, interceptor)
    : clone;

  const adapter_ = Chunk.isEmpty(newInterceptors)
    ? Effect.succeed(adapter)
    : provide(makeInterceptor(newInterceptors), adapter);

  return make.pipe(Effect.provide(Fetch.effect(adapter_)));
};

export const layer = Layer.effect(Client, make);
