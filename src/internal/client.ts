import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Config, Client, Handler } from "../Client.js";
import * as Fetch from "../Fetch.js";
import type { Merge } from "../Interceptor.js";
import { copy, empty, make as makeAdapter } from "../Interceptor.js";
import { Url } from "../Interceptors/Url.js";
import { filterStatusOk } from "./response/index.js";

type Method = NonNullable<RequestInit["method"]>;

export const make = Effect.gen(function* () {
  const fetch = yield* Fetch.Fetch;

  const withMethod = (method: Method): Handler => {
    return (url, init) => {
      return Effect.flatMap(fetch(url, { ...init, method }), filterStatusOk);
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

  return Chunk.isEmpty(newInterceptors)
    ? Fetch.make(adapter)
    : Fetch.effect(makeAdapter(adapter, newInterceptors));
};

export const layer = Layer.effect(Client, make);
