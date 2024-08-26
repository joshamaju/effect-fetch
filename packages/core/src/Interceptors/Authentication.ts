/**
 * @since 0.0.1
 */

import { Chain } from "../Interceptor.js";
import { HttpRequest } from "../Request.js";

/**
 * @since 0.0.1
 * @category interceptor
 */
export const BearerToken = (token: string) => {
  return (chain: Chain) => {
    const req = chain.request;
    const headers = new Headers(req.init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return chain.proceed(new HttpRequest(req.url, { ...req.init, headers }));
  };
};

/**
 * @since 0.0.1
 * @category interceptor
 */
export const Basic = (username: string, password: string) => {
  return (chain: Chain) => {
    const req = chain.request;
    const headers = new Headers(req.init?.headers);
    headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
    return chain.proceed(new HttpRequest(req.url, { ...req.init, headers }));
  };
};
