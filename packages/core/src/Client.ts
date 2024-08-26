/**
 * @since 0.0.1
 */

import { Either } from "fp-ts/Either";

import { StatusError } from "./Error.js";
import { Adapter, Fetch } from "./Fetch.js";
import { Interceptors } from "./Interceptor.js";
import { Body } from "./internal/body.js";
import * as internal from "./internal/client.js";
import { HttpError } from "./internal/error.js";
import { HttpRequest } from "./internal/request.js";
import { TimeoutError } from "./Interceptors/Timeout.js";

/** @internal */
export type Config<E, R> = {
  url?: string;
  adapter: Adapter;
  timeout?: number;
  interceptors?: Interceptors<E, R>;
};

export type Handler = (
  url: string | URL | HttpRequest,
  init?:
    | RequestInit
    | (Omit<RequestInit, "body"> & { body?: Body | BodyInit })
    | Body
    | undefined
) => (fetch: Fetch<any>) => Promise<Either<HttpError | StatusError, Response>>;

/**
 * @since 0.0.1
 * @category constructor
 */
export const create: {
  <E = never, R = never>(
    config: Config<E, R> & Omit<Config<E, R>, "timeout"> & { timeout: number }
  ): Fetch<E | HttpError | TimeoutError>;
  <E = never, R = never>(config: Config<E, R>): Fetch<E | HttpError>;
} = internal.create;

/**
 * @since 0.0.1
 * @category constructor
 */
export const put: Handler = internal.put;

/**
 * @since 0.0.1
 * @category constructor
 */
export const get: Handler = internal.get;

/**
 * @since 0.0.1
 * @category constructor
 */
export const head: Handler = internal.head;

/**
 * @since 0.0.1
 * @category constructor
 */
export const post: Handler = internal.post;

/**
 * @since 0.0.1
 * @category constructor
 */
export const patch: Handler = internal.patch;

/**
 * @since 0.0.1
 * @category constructor
 */
export const options: Handler = internal.options;

const delete_: Handler = internal.delete_;

export {
  /**
   * @since 0.0.1
   * @category constructor
   */
  delete_ as delete,
};
