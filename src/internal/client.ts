import * as Effect from "effect/Effect";
import * as Chunk from "effect/Chunk";

import { Url } from "../Interceptors/Url.js";
import { Client, Handler } from "../Client.js";
import * as Fetch from "../Fetch.js";
import {
  Interceptors,
  copy,
  empty,
  makeAdapter,
  Merge,
} from "../Interceptor.js";

import { filterStatusOk } from "./response/index.js";

type Method = NonNullable<RequestInit["method"]>;

export const make = Effect.gen(function* (_) {
  const fetch = yield* _(Fetch.Fetch);

  const withMethod = (method: Method): Handler => {
    return (url, init) =>
      fetch(url, { ...init, method }).pipe(Effect.flatMap(filterStatusOk));
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

export const create = <R, E>({
  url,
  adapter,
  interceptors = empty(),
}: {
  url?: string;
  adapter: Fetch.Fetch;
  interceptors?: Interceptors<R, E>;
}) => {
  const clone = copy(interceptors);
  const interceptor = url ? Url(url) : null;

  type Interceptors = Merge<typeof clone, NonNullable<typeof interceptor>>;

  const newInterceptors: Interceptors = interceptor
    ? clone.pipe(Chunk.prepend(interceptor))
    : clone;

  return Chunk.isEmpty(newInterceptors)
    ? Fetch.make(adapter)
    : Fetch.effect(makeAdapter(adapter, newInterceptors));
};
