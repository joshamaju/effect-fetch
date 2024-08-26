import { chain } from "fp-ts/Either";

import { Config, Handler } from "../Client.js";
import * as Fetch from "../Fetch.js";
import type { Interceptor, Interceptors, Merge } from "../Interceptor.js";
import { add, copy, empty, make as makeInterceptor } from "../Interceptor.js";
import { isBody } from "./body.js";
import { filterStatusOk } from "./response/index.js";

import Timeout from "../Interceptors/Timeout.js";
import BaseURL from "../Interceptors/Url.js";

type Method = NonNullable<RequestInit["method"]>;

const method = (method: Method): Handler => {
  return (url, init) => {
    return async (fetch: Fetch.Fetch<any>) => {
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

      const res = await fetch(url, { ...init, body, method, headers });

      return chain(filterStatusOk)(res);
    };
  };
};

export const get = method("GET");

export const put = method("PUT");

export const post = method("POST");

export const head = method("HEAD");

export const patch = method("PATCH");

export const delete_ = method("DELETE");

export const options = method("OPTIONS");

type MaybeMerge<I extends Interceptors<any, any>, T> =
  T extends Interceptor<any, any> ? Merge<I, T> : I;

export const create = <E, R>({
  url,
  timeout,
  adapter,
  // @ts-expect-error
  interceptors = empty(),
}: Config<E, R>) => {
  const clone = copy(interceptors);
  const baseurl_interceptor = url ? BaseURL(url) : null;

  const timeout_interceptor =
    typeof timeout !== "undefined" ? Timeout(timeout) : null;

  type Interceptors = MaybeMerge<
    MaybeMerge<typeof clone, typeof baseurl_interceptor>,
    typeof timeout_interceptor
  >;

  let interceptors_ = baseurl_interceptor
    ? ([baseurl_interceptor, ...clone] as Interceptors)
    : clone;

  if (timeout_interceptor) {
    interceptors_ = add(interceptors_, timeout_interceptor);
  }

  const adapter_ =
    interceptors_.length <= 0
      ? adapter
      : makeInterceptor(interceptors_)(adapter);

  return adapter_;
};
