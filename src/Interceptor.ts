/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import { Fetch } from "./internal/fetch.js";
import * as internal from "./internal/interceptor.js";
import { Interceptor } from "./internal/interceptor.js";

/**
 * Creates the intercepting wrapper around the provided platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeFetch: (
  ...interceptors: Array<Interceptor>
) => Effect<Fetch, never, Fetch> = internal.intercept;

/**
 * Provides the given platform adapter to the interceptor `Fetch` wrapper
 * 
 * @since 1.0.0
 * @category constructors
 */
export const makeAdapter: (
  fetch: Fetch,
  ...interceptors: Array<Interceptor>
) => Effect<never, never, Fetch> = internal.provide;
