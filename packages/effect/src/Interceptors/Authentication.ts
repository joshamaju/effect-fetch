/**
 * @since 2.1.0
 */

import * as Effect from "effect/Effect";

import { Chain } from "../Interceptor.js";
import { make } from "../Request.js";

/**
 * @since 2.1.0
 * @category interceptor
 */
export const BearerToken = (token: string) => {
  return Effect.flatMap(Chain, (chain) => {
    const req = chain.request;
    const headers = new Headers(req.init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return chain.proceed(make(req.url, { ...req.init, headers }));
  });
};

/**
 * @since 2.1.0
 * @category interceptor
 */
export const Basic = (username: string, password: string) => {
  return Effect.flatMap(Chain, (chain) => {
    const req = chain.request;
    const headers = new Headers(req.init?.headers);
    headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
    return chain.proceed(make(req.url, { ...req.init, headers }));
  });
};
