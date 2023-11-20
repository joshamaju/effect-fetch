import type { Effect } from "effect/Effect";

import { Fetch } from "./internal/fetch.js";
import * as internal from "./internal/intercept.js";
import { Interceptor } from "./internal/intercept.js";

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
 * @since 1.0.0
 * @category constructors
 */
export const makeAdapter: (
  fetch: Fetch,
  ...interceptors: Array<Interceptor>
) => Effect<never, never, Fetch> = internal.provide;
