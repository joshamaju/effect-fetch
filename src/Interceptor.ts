/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import * as Chunk from "effect/Chunk";
import { GenericTag } from "effect/Context";
import { dual } from "effect/Function";

import { Adapter, Fetch } from "./Fetch.js";
import * as internal from "./internal/interceptor.js";
import { HttpRequest } from "./internal/request.js";
import { HttpError } from "./Error.js";

/** @internal */
export type Merge<
  I extends Interceptors<any, any>,
  T extends Interceptor<any, any>
> = I extends Interceptors<infer R1, infer E1>
  ? T extends Interceptor<infer R2, infer E2>
    ? Interceptors<R1 | R2, E1 | E2>
    : never
  : never;

/**
 * @since 1.0.0
 * @category model
 */
export interface Chain {
  request: HttpRequest;
  proceed(request: HttpRequest): Effect<Response, HttpError, never>;
}

/**
 * @since 1.2.3
 * @category model
 */
export interface Interceptor<E, R> extends Effect<Response, E, R | Chain> {}

/**
 * @since 1.2.3
 * @category model
 */
export type Interceptors<E, R> = Chunk.Chunk<Interceptor<E, R>>;

/**
 * @since 1.0.0
 * @category tag
 */
export const Chain = GenericTag<Chain>("effect-fetch/Interceptor")

/**
 * @since 1.2.0
 * @category constructors
 */
export const of: <E, R>(interceptor: Interceptor<E, R>) => Interceptors<E, R> =
  Chunk.of;

/**
 * @since 1.0.0
 * @category constructors
 */
export const empty: () => Interceptors<never, never> = Chunk.empty;

/**
 * @since 1.0.0
 * @category combinators
 */
export const add: {
  <T extends Interceptor<any, any>>(interceptor: T): <E, R>(
    interceptors: Interceptors<E, R>
  ) => Merge<Interceptors<E, R>, T>;
  <T extends Interceptor<any, any>, E, R>(
    interceptors: Interceptors<E, R>,
    interceptor: T
  ): Merge<Interceptors<E, R>, T>;
} = Chunk.append;

/**
 * @since 1.4.0
 * @category constructor
 */
export const copy: <E, R>(
  interceptors: Interceptors<E, R>
) => Interceptors<E, R> = internal.copy;

/**
 * Creates the intercepting wrapper around the provided platform adapter
 *
 * @since 2.0.0
 * @category constructors
 */
export const make: <E, R>(
  interceptors: Interceptors<E, R>
) => Effect<Adapter, E, Exclude<R, Chain> | Fetch> = internal.make;

/**
 * Provides the given platform adapter to the interceptor `Fetch` wrapper
 *
 * @since 2.0.0
 * @category constructors
 */
export const provide: {
  <E, R>(fetch: Adapter): (
    interceptor: Effect<Adapter, E, R | Fetch>
  ) => Effect<Adapter, E, Exclude<R, Fetch>>;
  <E, R>(interceptor: Effect<Adapter, E, R | Fetch>, fetch: Adapter): Effect<
    Adapter,
    E,
    Exclude<R, Fetch>
  >;
} = dual<
  <E, R>(
    fetch: Adapter
  ) => (
    interceptor: Effect<Adapter, E, R | Fetch>
  ) => Effect<Adapter, E, Exclude<R, Fetch>>,
  <E, R>(
    interceptor: Effect<Adapter, E, R | Fetch>,
    fetch: Adapter,
  ) => Effect<Adapter, E, Exclude<R, Fetch>>
>(2, (interceptor, fetch) => internal.provide(interceptor, fetch));
