/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import * as Chunk from 'effect/Chunk'

import { Fetch } from "./Fetch.js";
import { Tag } from "effect/Context";
import * as internal from "./internal/interceptor.js";
import { Interceptor, Interceptors, Merge } from "./internal/interceptor.js";

export interface Context extends internal.Context {}

export const Context: Tag<internal.Context, internal.Context> =
  internal.Context;

  /**
 * @since 1.2.0
 * @category constructors
 */
export const of: <R, E>(interceptor: Interceptor<R, E>) => Interceptors<R, E> = Chunk.of

/**
 * @since 1.0.0
 * @category constructors
 */
export const empty: () => Interceptors<never, never> = Chunk.empty

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
