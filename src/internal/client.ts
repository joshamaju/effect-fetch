import * as Effect from "effect/Effect";

import { Fetch } from "../Fetch.js";
import { Client } from "../Client.js";

type Method = NonNullable<RequestInit["method"]>;

export const make = Effect.gen(function* (_) {
  const fetch = yield* _(Fetch);

  const withMethod = (method: Method): Fetch => {
    return (url, init) => fetch(url, { ...init, method });
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