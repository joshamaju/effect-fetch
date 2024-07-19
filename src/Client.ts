/**
 * @since 1.3.0
 */
import { Tag } from "effect/Context";
import type { Layer } from "effect/Layer";
import type { Effect } from "effect/Effect";
import { serviceFunctions } from "effect/Effect";
import { TimeoutException } from "effect/Cause";
import { Duration } from "effect/Duration";

import { Adapter, Fetch } from "./Fetch.js";
import { Chain, Interceptors } from "./Interceptor.js";
import { HttpError } from "./internal/error.js";
import { HttpRequest } from "./internal/request.js";
import { StatusError } from "./Error.js";
import * as internal from "./internal/client.js";
import { Body } from "./internal/body.js";

/** @internal */
export type Config<E, R> = {
  url?: string;
  adapter: Adapter;
  timeout?:
    | number // millis
    | Duration;
  interceptors?: Interceptors<E, R>;
};

/** @internal */
export type Handler = (
  url: string | URL | HttpRequest,
  init?:
    | RequestInit
    | (Omit<RequestInit, "body"> & { body?: Body | BodyInit })
    | Body
    | undefined
) => Effect<Response, HttpError | StatusError, never>;

/**
 * @since 1.3.0
 * @category model
 */
export interface Handlers {
  put: Handler;
  get: Handler;
  head: Handler;
  post: Handler;
  patch: Handler;
  delete: Handler;
  options: Handler;
}

/**
 * @since 1.3.0
 * @category tag
 */
export class Client extends Tag("effect-fetch/Client")<Client, Handlers>() {}

/**
 * @since 1.3.0
 * @category constructor
 * @deprecated
 */
export const make: Effect<Handlers, never, Fetch> = internal.make;

/**
 * @since 1.3.0
 * @category constructor
 */
export const layer: Layer<Client, never, Fetch> = internal.layer;

/**
 * @since 1.4.0
 * @category constructor
 */
export const create: {
  <E = never, R = never>(
    config: Config<E, R> &
      Omit<Config<E, R>, "timeout"> & {
        timeout: number | Duration;
      }
  ): Effect<
    Handlers,
    E | HttpError | TimeoutException,
    Exclude<Exclude<R, Chain>, Fetch>
  >;
  <E = never, R = never>(config: Config<E, R>): Effect<
    Handlers,
    E | HttpError,
    Exclude<Exclude<R, Chain>, Fetch>
  >;
} = internal.create;

const handlers = serviceFunctions(make);

/**
 * @since 1.3.0
 * @category constructor
 */
export const put = handlers.put;

/**
 * @since 1.3.0
 * @category constructor
 */
export const get = handlers.get;

/**
 * @since 1.3.0
 * @category constructor
 */
export const head = handlers.head;

/**
 * @since 1.3.0
 * @category constructor
 */
export const post = handlers.post;

/**
 * @since 1.3.0
 * @category constructor
 */
export const patch = handlers.patch;

/**
 * @since 1.3.0
 * @category constructor
 */
export const options = handlers.options;

const delete_ = handlers.delete;

export {
  /**
   * @since 1.3.0
   * @category constructor
   */
  delete_ as delete,
};
