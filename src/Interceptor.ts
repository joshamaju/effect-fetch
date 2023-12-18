/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import * as Chunk from "effect/Chunk";

import { Fetch } from "./Fetch.js";
import { Tag } from "effect/Context";
import * as internal from "./internal/interceptor.js";
import { HttpRequest } from "./internal/request.js";
import { HttpError } from "./Error.js";

/** @internal */
export type Merge<
  I extends Interceptors<any, any>,
  T extends Interceptor<any, any>,
> = I extends Interceptors<infer R1, infer E1>
  ? T extends Interceptor<infer R2, infer E2>
    ? Interceptors<R1 | R2, E1 | E2>
    : never
  : never;

/**
 * @since 1.0.0
 * @category model
 */
export interface Context {
  request: HttpRequest;
  proceed(request: HttpRequest): Effect<never, HttpError, Response>;
}

/**
 * @since 1.2.3
 * @category model
 */
export interface Interceptor<R, E> extends Effect<R | Context, E, Response> {}

/**
 * @since 1.2.3
 * @category model
 */
export type Interceptors<R, E> = Chunk.Chunk<Interceptor<R, E>>;

/**
 * @since 1.0.0
 * @category tag
 */
export const Context = Tag<Context>();

/**
 * @since 1.2.0
 * @category constructors
 */
export const of: <R, E>(interceptor: Interceptor<R, E>) => Interceptors<R, E> =
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
  <T extends Interceptor<any, any>>(
    interceptor: T
  ): <R, E>(interceptors: Interceptors<R, E>) => Merge<Interceptors<R, E>, T>;
  <R, E, T extends Interceptor<any, any>>(
    interceptors: Interceptors<R, E>,
    interceptor: T
  ): Merge<Interceptors<R, E>, T>;
} = Chunk.append;

/**
 * Creates the intercepting wrapper around the provided platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeFetch: <R, E>(
  interceptors: Interceptors<R, E>
) => Effect<Exclude<R, Context> | Fetch, E, Fetch> = internal.intercept;

/**
 * Provides the given platform adapter to the interceptor `Fetch` wrapper
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeAdapter: {
  <R, E>(
    interceptors: Interceptors<R, E>
  ): (fetch: Fetch) => Effect<Exclude<R, Context>, E, Fetch>;
  <R, E>(
    fetch: Fetch,
    interceptors: Interceptors<R, E>
  ): Effect<Exclude<R, Context>, E, Fetch>;
} = internal.makeAdapter;
